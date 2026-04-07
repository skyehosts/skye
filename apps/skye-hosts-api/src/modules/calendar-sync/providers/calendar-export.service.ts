import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { Listing } from '../../listing/entities';
import { CalendarBlock, CalendarSync } from '../entities';

@Injectable()
export class CalendarExportService {
  private readonly logger = new Logger(CalendarExportService.name);

  constructor(
    @InjectRepository(CalendarSync)
    private readonly calendarSyncRepo: Repository<CalendarSync>,
    @InjectRepository(CalendarBlock)
    private readonly calendarBlockRepo: Repository<CalendarBlock>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
  ) {}

  async generateIcal(exportToken: string): Promise<string | null> {
    const sync = await this.calendarSyncRepo.findOne({
      where: { exportToken },
    });

    if (!sync) {
      return null;
    }

    const listing = await this.listingRepo.findOne({
      where: { id: sync.listingId },
    });

    if (!listing) {
      return null;
    }

    // Record that the external platform fetched the iCal — used to surface a
    // warning to hosts when AirBnB hasn't started polling 24h after setup.
    await this.calendarSyncRepo.update(sync.id, { lastExportedAt: new Date() });

    const today = new Date().toISOString().slice(0, 10);

    const [bookings, blocks] = await Promise.all([
      this.bookingRepo.find({
        where: {
          listingId: sync.listingId,
          status: In(['pending', 'confirmed']),
          checkOutDate: MoreThanOrEqual(today),
        },
      }),
      this.calendarBlockRepo.find({
        where: {
          listingId: sync.listingId,
          source: 'import',
          endDate: MoreThanOrEqual(today),
        },
      }),
    ]);

    this.logger.debug(
      `Export for listing ${sync.listingId}: ${bookings.length} bookings, ${blocks.length} blocks`,
    );

    const now =
      new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skye Hosts//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.escapeIcalText(listing.title)}`,
    ];

    for (const booking of bookings) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:skye-booking-${booking.id}@skyehosts.com`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${this.formatDate(booking.checkInDate)}`,
        `DTEND;VALUE=DATE:${this.formatDate(booking.checkOutDate)}`,
        'SUMMARY:Reserved',
        'STATUS:CONFIRMED',
        'END:VEVENT',
      );
    }

    for (const block of blocks) {
      const summary = block.summary ?? 'Blocked';
      lines.push(
        'BEGIN:VEVENT',
        `UID:skye-block-${block.id}@skyehosts.com`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${this.formatDate(block.startDate)}`,
        `DTEND;VALUE=DATE:${this.formatDate(block.endDate)}`,
        `SUMMARY:${this.escapeIcalText(summary)}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  private formatDate(dateStr: string): string {
    return dateStr.replace(/-/g, '');
  }

  private escapeIcalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }
}
