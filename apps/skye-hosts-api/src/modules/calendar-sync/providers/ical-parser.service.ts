import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import ICAL from 'ical.js';

export interface ParsedCalendarEvent {
  uid: string;
  startDate: string;
  endDate: string;
  summary: string | null;
}

@Injectable()
export class IcalParserService {
  private readonly logger = new Logger(IcalParserService.name);

  parse(icalText: string): ParsedCalendarEvent[] {
    const jcalData = ICAL.parse(icalText);
    const component = new ICAL.Component(jcalData);
    const vevents = component.getAllSubcomponents('vevent');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const events: ParsedCalendarEvent[] = [];

    for (const vevent of vevents) {
      try {
        const event = new ICAL.Event(vevent);

        const dtstart = event.startDate;
        const dtend = event.endDate;

        if (!dtstart || !dtend) {
          this.logger.debug('Skipping VEVENT with missing DTSTART or DTEND');
          continue;
        }

        const startDate = this.toDateString(dtstart);
        const endDate = this.toDateString(dtend);

        // Skip past events
        if (endDate < todayStr) {
          continue;
        }

        let uid = event.uid;
        if (!uid) {
          // Generate deterministic UID from dates + summary
          const summary = event.summary ?? '';
          uid = this.generateDeterministicUid(startDate, endDate, summary);
          this.logger.debug(
            `VEVENT missing UID, generated deterministic UID: ${uid}`,
          );
        }

        events.push({
          uid,
          startDate,
          endDate,
          summary: event.summary ?? null,
        });
      } catch (error) {
        this.logger.debug(
          `Skipping unparseable VEVENT: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return events;
  }

  private toDateString(icalTime: ICAL.Time): string {
    return `${icalTime.year}-${String(icalTime.month).padStart(2, '0')}-${String(icalTime.day).padStart(2, '0')}`;
  }

  private generateDeterministicUid(
    startDate: string,
    endDate: string,
    summary: string,
  ): string {
    const hash = createHash('sha256')
      .update(`${startDate}|${endDate}|${summary}`)
      .digest('hex')
      .slice(0, 16);
    return `generated-${hash}`;
  }
}
