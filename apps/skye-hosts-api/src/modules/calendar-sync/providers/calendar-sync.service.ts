import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type {
  ICalendarBlockDto,
  ICalendarSyncDto,
} from '@repo/skye-hosts-api-client';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { ListingAccessService } from '../../co-host/providers';
import { ConfigService } from '../../config/providers/config.service';
import { CalendarBlock, CalendarSync } from '../entities';

@Injectable()
export class CalendarSyncService {
  private readonly logger = new Logger(CalendarSyncService.name);

  constructor(
    @InjectRepository(CalendarSync)
    private readonly calendarSyncRepo: Repository<CalendarSync>,
    @InjectRepository(CalendarBlock)
    private readonly calendarBlockRepo: Repository<CalendarBlock>,
    private readonly listingAccessService: ListingAccessService,
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async assertPermission(
    accountId: number,
    listingId: number,
    permission: ListingPermission,
  ): Promise<void> {
    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      listingId,
      permission,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
  }

  async getSyncsForListing(listingId: number): Promise<CalendarSync[]> {
    return this.calendarSyncRepo.find({
      where: { listingId },
      order: { createdAt: 'ASC' },
    });
  }

  async getSyncById(id: number): Promise<CalendarSync | null> {
    return this.calendarSyncRepo.findOne({ where: { id } });
  }

  async getSyncByExportToken(
    exportToken: string,
  ): Promise<CalendarSync | null> {
    return this.calendarSyncRepo.findOne({ where: { exportToken } });
  }

  async createSync(
    listingId: number,
    data: {
      platform: string;
      label: string;
      importUrl?: string;
      isImportEnabled?: boolean;
      isExportEnabled?: boolean;
    },
  ): Promise<CalendarSync> {
    const sync = this.calendarSyncRepo.create({
      listingId,
      platform: data.platform as CalendarSync['platform'],
      label: data.label,
      importUrl: data.importUrl ?? null,
      exportToken: randomUUID(),
      isImportEnabled: data.isImportEnabled ?? true,
      isExportEnabled: data.isExportEnabled ?? true,
    });
    return this.calendarSyncRepo.save(sync);
  }

  async updateSync(
    id: number,
    data: {
      label?: string;
      importUrl?: string | null;
      isImportEnabled?: boolean;
      isExportEnabled?: boolean;
    },
  ): Promise<CalendarSync> {
    const sync = await this.calendarSyncRepo.findOne({ where: { id } });
    if (!sync) {
      throw new NotFoundException('Calendar sync not found');
    }

    if (data.label !== undefined) sync.label = data.label;
    if (data.importUrl !== undefined) sync.importUrl = data.importUrl;
    if (data.isImportEnabled !== undefined)
      sync.isImportEnabled = data.isImportEnabled;
    if (data.isExportEnabled !== undefined)
      sync.isExportEnabled = data.isExportEnabled;

    // Re-enable import if URL was updated, sync was auto-disabled,
    // and user did not explicitly request disabling in this same request
    if (
      data.importUrl &&
      sync.consecutiveFailures >= 10 &&
      data.isImportEnabled !== false
    ) {
      sync.consecutiveFailures = 0;
      sync.isImportEnabled = true;
      sync.lastImportError = null;
    }

    return this.calendarSyncRepo.save(sync);
  }

  async deleteSync(id: number, removeBlocks: boolean): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      if (removeBlocks) {
        await manager.delete(CalendarBlock, { calendarSyncId: id });
      }
      await manager.delete(CalendarSync, { id });
    });
  }

  async getBlocksForListing(listingId: number): Promise<CalendarBlock[]> {
    return this.calendarBlockRepo.find({
      where: { listingId },
      order: { startDate: 'ASC' },
    });
  }

  async createManualBlock(
    listingId: number,
    startDate: string,
    endDate: string,
  ): Promise<CalendarBlock> {
    const block = this.calendarBlockRepo.create({
      listingId,
      source: 'manual',
      startDate,
      endDate,
      calendarSyncId: null,
      externalUid: null,
      summary: null,
    });
    return this.calendarBlockRepo.save(block);
  }

  async getBlockById(id: number): Promise<CalendarBlock | null> {
    return this.calendarBlockRepo.findOne({ where: { id } });
  }

  async deleteBlock(id: number): Promise<void> {
    const result = await this.calendarBlockRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Calendar block not found');
    }
  }

  buildExportUrl(exportToken: string): string {
    const baseUrl = this.configService.getAll().apiBaseUrl;
    return `${baseUrl}/calendar-sync/export/${exportToken}.ics`;
  }

  toSyncDto(sync: CalendarSync): ICalendarSyncDto {
    return {
      id: sync.id,
      listingId: sync.listingId,
      platform: sync.platform,
      label: sync.label,
      importUrl: sync.importUrl,
      exportUrl: this.buildExportUrl(sync.exportToken),
      lastImportAt: sync.lastImportAt?.toISOString() ?? null,
      lastImportStatus: sync.lastImportStatus,
      lastImportError: sync.lastImportError,
      lastImportEventCount: sync.lastImportEventCount,
      consecutiveFailures: sync.consecutiveFailures,
      isImportEnabled: sync.isImportEnabled,
      isExportEnabled: sync.isExportEnabled,
      createdAt: sync.createdAt.toISOString(),
    };
  }

  toBlockDto(block: CalendarBlock): ICalendarBlockDto {
    return {
      id: block.id,
      listingId: block.listingId,
      calendarSyncId: block.calendarSyncId,
      source: block.source,
      startDate: block.startDate,
      endDate: block.endDate,
      summary: block.summary,
    };
  }
}
