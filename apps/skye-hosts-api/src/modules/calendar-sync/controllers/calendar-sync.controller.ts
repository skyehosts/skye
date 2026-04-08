import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type {
  ICalendarBlockResponseDto,
  ICalendarSyncResponseDto,
  IGetCalendarBlocksResponseDto,
  IGetCalendarSyncsResponseDto,
  IUnblockRangeResponseDto,
} from '@repo/skye-hosts-api-client';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import type { Response } from 'express';
import {
  AuthenticatedUser,
  AuthoriseRole,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  CreateCalendarBlockRequestDto,
  CreateCalendarSyncRequestDto,
  UnblockRangeRequestDto,
  UpdateCalendarSyncRequestDto,
} from '../dto';
import { CalendarExportService } from '../providers/calendar-export.service';
import { CalendarImportService } from '../providers/calendar-import.service';
import { CalendarSyncService } from '../providers/calendar-sync.service';

const RATE_LIMIT_MS = 60_000;

@Controller('calendar-sync')
export class CalendarSyncController {
  private readonly logger = new Logger(CalendarSyncController.name);
  private readonly manualSyncTimestamps = new Map<number, number>();

  constructor(
    private readonly calendarSyncService: CalendarSyncService,
    private readonly calendarExportService: CalendarExportService,
    private readonly calendarImportService: CalendarImportService,
  ) {}

  @Get('listing/:listingId')
  @AuthoriseRole('host')
  async getSyncsForListing(
    @Param('listingId', ParseIntPipe) listingId: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<IGetCalendarSyncsResponseDto> {
    await this.calendarSyncService.assertPermission(
      user.sub,
      listingId,
      ListingPermission.VIEW_CALENDAR,
    );

    const syncs = await this.calendarSyncService.getSyncsForListing(listingId);

    return { syncs: syncs.map((s) => this.calendarSyncService.toSyncDto(s)) };
  }

  @Post('listing/:listingId')
  @AuthoriseRole('host')
  async createSync(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() body: CreateCalendarSyncRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<ICalendarSyncResponseDto> {
    await this.calendarSyncService.assertPermission(
      user.sub,
      listingId,
      ListingPermission.EDIT_CALENDAR,
    );

    const sync = await this.calendarSyncService.createSync(listingId, body);

    return { sync: this.calendarSyncService.toSyncDto(sync) };
  }

  @Patch(':id')
  @AuthoriseRole('host')
  async updateSync(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCalendarSyncRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<ICalendarSyncResponseDto> {
    const existing = await this.calendarSyncService.getSyncById(id);
    if (!existing) throw new NotFoundException('Calendar sync not found');

    await this.calendarSyncService.assertPermission(
      user.sub,
      existing.listingId,
      ListingPermission.EDIT_CALENDAR,
    );

    const sync = await this.calendarSyncService.updateSync(id, body);

    return { sync: this.calendarSyncService.toSyncDto(sync) };
  }

  @Delete(':id')
  @AuthoriseRole('host')
  async deleteSync(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<{ deleted: boolean }> {
    const existing = await this.calendarSyncService.getSyncById(id);
    if (!existing) throw new NotFoundException('Calendar sync not found');

    await this.calendarSyncService.assertPermission(
      user.sub,
      existing.listingId,
      ListingPermission.EDIT_CALENDAR,
    );

    await this.calendarSyncService.deleteSync(id);
    this.logger.debug(`Deleted sync ${id}`);
    return { deleted: true };
  }

  @Post(':id/trigger-import')
  @AuthoriseRole('host')
  async triggerImport(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<ICalendarSyncResponseDto> {
    const existing = await this.calendarSyncService.getSyncById(id);
    if (!existing) throw new NotFoundException('Calendar sync not found');

    await this.calendarSyncService.assertPermission(
      user.sub,
      existing.listingId,
      ListingPermission.EDIT_CALENDAR,
    );

    // Rate limit: 1 per minute per sync (in-memory, single-instance only)
    const now = Date.now();
    const lastTrigger = this.manualSyncTimestamps.get(id);
    if (lastTrigger && now - lastTrigger < RATE_LIMIT_MS) {
      throw new HttpException(
        'Please wait at least 1 minute between manual syncs',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.manualSyncTimestamps.set(id, now);
    this.pruneStaleRateLimitEntries(now);

    const sync = await this.calendarImportService.importSingleSync(existing);

    return { sync: this.calendarSyncService.toSyncDto(sync) };
  }

  @Get('listing/:listingId/blocks')
  @AuthoriseRole('host')
  async getBlocksForListing(
    @Param('listingId', ParseIntPipe) listingId: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<IGetCalendarBlocksResponseDto> {
    await this.calendarSyncService.assertPermission(
      user.sub,
      listingId,
      ListingPermission.VIEW_CALENDAR,
    );

    const blocks =
      await this.calendarSyncService.getBlocksForListing(listingId);

    return {
      blocks: blocks.map((b) => this.calendarSyncService.toBlockDto(b)),
    };
  }

  @Post('listing/:listingId/blocks')
  @AuthoriseRole('host')
  async createManualBlock(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() body: CreateCalendarBlockRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<ICalendarBlockResponseDto> {
    await this.calendarSyncService.assertPermission(
      user.sub,
      listingId,
      ListingPermission.EDIT_CALENDAR,
    );

    const block = await this.calendarSyncService.createManualBlock(
      listingId,
      body.startDate,
      body.endDate,
    );

    return { block: this.calendarSyncService.toBlockDto(block) };
  }

  @Post('listing/:listingId/blocks/unblock-range')
  @AuthoriseRole('host')
  async unblockRange(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() body: UnblockRangeRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<IUnblockRangeResponseDto> {
    await this.calendarSyncService.assertPermission(
      user.sub,
      listingId,
      ListingPermission.EDIT_CALENDAR,
    );

    const blocks = await this.calendarSyncService.unblockRange(
      listingId,
      body.startDate,
      body.endDate,
    );

    return {
      blocks: blocks.map((b) => this.calendarSyncService.toBlockDto(b)),
    };
  }

  @Delete('blocks/:id')
  @AuthoriseRole('host')
  async deleteBlock(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<{ deleted: boolean }> {
    const existing = await this.calendarSyncService.getBlockById(id);
    if (!existing) throw new NotFoundException('Calendar block not found');

    await this.calendarSyncService.assertPermission(
      user.sub,
      existing.listingId,
      ListingPermission.EDIT_CALENDAR,
    );

    await this.calendarSyncService.deleteBlock(id);
    return { deleted: true };
  }

  @Get('export/:exportToken.ics')
  @IgnoreBearerAuthentication()
  async exportCalendar(
    @Param('exportToken') exportToken: string,
    @Res() res: Response,
  ): Promise<void> {
    const icalContent =
      await this.calendarExportService.generateIcal(exportToken);

    if (!icalContent) {
      throw new NotFoundException('Calendar not found');
    }

    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="calendar.ics"',
      'Cache-Control': 'public, max-age=300',
    });
    res.send(icalContent);
  }

  private pruneStaleRateLimitEntries(now: number): void {
    for (const [syncId, timestamp] of this.manualSyncTimestamps) {
      if (now - timestamp > RATE_LIMIT_MS) {
        this.manualSyncTimestamps.delete(syncId);
      }
    }
  }
}
