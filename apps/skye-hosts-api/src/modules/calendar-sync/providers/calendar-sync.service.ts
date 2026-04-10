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
  IUnavailableDateRange,
} from '@repo/skye-hosts-api-client';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { randomUUID } from 'crypto';
import { DataSource, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
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
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
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
      label?: string;
      importUrl: string;
    },
  ): Promise<CalendarSync> {
    const sync = this.calendarSyncRepo.create({
      listingId,
      platform: data.platform as CalendarSync['platform'],
      label: data.label ?? null,
      importUrl: data.importUrl,
      exportToken: randomUUID(),
    });
    return this.calendarSyncRepo.save(sync);
  }

  async updateSync(
    id: number,
    data: {
      label?: string;
      importUrl?: string;
    },
  ): Promise<CalendarSync> {
    const sync = await this.calendarSyncRepo.findOne({ where: { id } });
    if (!sync) {
      throw new NotFoundException('Calendar sync not found');
    }

    if (data.label !== undefined) sync.label = data.label;
    if (data.importUrl !== undefined) sync.importUrl = data.importUrl;

    // Re-enable import if URL was updated and sync was auto-disabled
    if (data.importUrl && sync.consecutiveFailures >= 10) {
      sync.consecutiveFailures = 0;
      sync.lastImportError = null;
    }

    return this.calendarSyncRepo.save(sync);
  }

  async deleteSync(id: number): Promise<void> {
    // Imported blocks are removed automatically by the FK ON DELETE CASCADE
    // (calendar_block.calendarSyncId → calendar_sync.id).
    await this.calendarSyncRepo.delete({ id });
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

  async unblockRange(
    listingId: number,
    rangeStart: string,
    rangeEnd: string,
  ): Promise<CalendarBlock[]> {
    return this.dataSource.transaction(async (manager) => {
      const blockRepo = manager.getRepository(CalendarBlock);

      // Find manual blocks that overlap the unblock range
      const overlapping = await blockRepo
        .createQueryBuilder('block')
        .where('block.listingId = :listingId', { listingId })
        .andWhere("block.source = 'manual'")
        .andWhere('block.startDate < :rangeEnd', { rangeEnd })
        .andWhere('block.endDate > :rangeStart', { rangeStart })
        .getMany();

      if (overlapping.length === 0) {
        return blockRepo.find({
          where: { listingId },
          order: { startDate: 'ASC' },
        });
      }

      this.logger.debug(
        `unblockRange(${listingId}, ${rangeStart}..${rangeEnd}): ${overlapping.length} overlapping blocks`,
      );

      // Delete all overlapping blocks
      await blockRepo.delete(overlapping.map((b) => b.id));

      // Create trimmed blocks for portions outside the unblock range
      const newBlocks: Partial<CalendarBlock>[] = [];
      for (const block of overlapping) {
        if (block.startDate < rangeStart) {
          newBlocks.push({
            listingId,
            source: 'manual',
            startDate: block.startDate,
            endDate: rangeStart,
            calendarSyncId: null,
            externalUid: null,
            summary: null,
          });
        }
        if (block.endDate > rangeEnd) {
          newBlocks.push({
            listingId,
            source: 'manual',
            startDate: rangeEnd,
            endDate: block.endDate,
            calendarSyncId: null,
            externalUid: null,
            summary: null,
          });
        }
      }

      if (newBlocks.length > 0) {
        await blockRepo.save(newBlocks.map((b) => blockRepo.create(b)));
      }

      return blockRepo.find({
        where: { listingId },
        order: { startDate: 'ASC' },
      });
    });
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
      lastExportedAt: sync.lastExportedAt?.toISOString() ?? null,
      lastImportAt: sync.lastImportAt?.toISOString() ?? null,
      lastImportStatus: sync.lastImportStatus,
      lastImportError: sync.lastImportError,
      lastImportEventCount: sync.lastImportEventCount,
      consecutiveFailures: sync.consecutiveFailures,
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

  async getUnavailabilityForListing(
    listingId: number,
  ): Promise<IUnavailableDateRange[]> {
    const today = new Date().toISOString().slice(0, 10);

    const [blocks, bookings] = await Promise.all([
      this.calendarBlockRepo.find({
        where: { listingId, endDate: MoreThanOrEqual(today) },
        order: { startDate: 'ASC' },
      }),
      this.bookingRepo.find({
        where: {
          listingId,
          status: In(['confirmed', 'pending']),
          checkOutDate: MoreThanOrEqual(today),
        },
        order: { checkInDate: 'ASC' },
      }),
    ]);

    this.logger.debug(
      `getUnavailabilityForListing(${listingId}): blocks=${blocks.length}, bookings=${bookings.length}`,
    );

    const ranges: IUnavailableDateRange[] = [];

    for (const block of blocks) {
      ranges.push({ startDate: block.startDate, endDate: block.endDate });
    }

    for (const booking of bookings) {
      ranges.push({
        startDate: booking.checkInDate,
        endDate: booking.checkOutDate,
      });
    }

    ranges.sort((a, b) => a.startDate.localeCompare(b.startDate));

    // Merge overlapping/adjacent ranges
    const merged: IUnavailableDateRange[] = [];
    for (const range of ranges) {
      const last = merged[merged.length - 1];
      if (last && range.startDate <= last.endDate) {
        if (range.endDate > last.endDate) {
          last.endDate = range.endDate;
        }
      } else {
        merged.push({ startDate: range.startDate, endDate: range.endDate });
      }
    }

    return merged;
  }
}
