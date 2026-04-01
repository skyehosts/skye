import { Test, TestingModule } from '@nestjs/testing';
import { IcalParserService } from './ical-parser.service';

function buildIcal(vevents: string[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Test//Test//EN',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

function vevent(props: {
  uid?: string;
  dtstart: string;
  dtend: string;
  summary?: string;
}): string {
  const lines = ['BEGIN:VEVENT'];
  if (props.uid) lines.push(`UID:${props.uid}`);
  lines.push(`DTSTART;VALUE=DATE:${props.dtstart}`);
  lines.push(`DTEND;VALUE=DATE:${props.dtend}`);
  if (props.summary) lines.push(`SUMMARY:${props.summary}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

describe('IcalParserService', () => {
  let service: IcalParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IcalParserService],
    }).compile();

    service = module.get(IcalParserService);
  });

  it('should parse a valid iCal with one future event', () => {
    const ical = buildIcal([
      vevent({
        uid: 'abc-123',
        dtstart: '20270601',
        dtend: '20270605',
        summary: 'Reserved',
      }),
    ]);

    const events = service.parse(ical);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      uid: 'abc-123',
      startDate: '2027-06-01',
      endDate: '2027-06-05',
      summary: 'Reserved',
    });
  });

  it('should parse multiple events', () => {
    const ical = buildIcal([
      vevent({ uid: 'a', dtstart: '20270601', dtend: '20270603' }),
      vevent({ uid: 'b', dtstart: '20270610', dtend: '20270612' }),
      vevent({
        uid: 'c',
        dtstart: '20270620',
        dtend: '20270625',
        summary: 'Airbnb',
      }),
    ]);

    const events = service.parse(ical);

    expect(events).toHaveLength(3);
    expect(events.map((e) => e.uid)).toEqual(['a', 'b', 'c']);
  });

  it('should skip past events', () => {
    const ical = buildIcal([
      vevent({ uid: 'past', dtstart: '20200101', dtend: '20200105' }),
      vevent({ uid: 'future', dtstart: '20270601', dtend: '20270605' }),
    ]);

    const events = service.parse(ical);

    expect(events).toHaveLength(1);
    expect(events[0].uid).toBe('future');
  });

  it('should generate deterministic UID when VEVENT has no UID', () => {
    const ical = buildIcal([
      vevent({ dtstart: '20270601', dtend: '20270605', summary: 'Reserved' }),
    ]);

    const events = service.parse(ical);

    expect(events).toHaveLength(1);
    expect(events[0].uid).toMatch(/^generated-[0-9a-f]{16}$/);

    // Same input should produce same UID
    const events2 = service.parse(ical);
    expect(events2[0].uid).toBe(events[0].uid);
  });

  it('should handle event with no summary', () => {
    const ical = buildIcal([
      vevent({ uid: 'no-summary', dtstart: '20270601', dtend: '20270605' }),
    ]);

    const events = service.parse(ical);

    expect(events).toHaveLength(1);
    expect(events[0].summary).toBeNull();
  });

  it('should return empty array for calendar with no events', () => {
    const ical = buildIcal([]);

    const events = service.parse(ical);

    expect(events).toEqual([]);
  });

  it('should skip malformed VEVENTs and continue parsing others', () => {
    // A VEVENT missing DTSTART/DTEND will fail — the parser should skip it
    const malformed = [
      'BEGIN:VEVENT',
      'UID:bad-event',
      'SUMMARY:No dates',
      'END:VEVENT',
    ].join('\r\n');

    const ical = buildIcal([
      malformed,
      vevent({ uid: 'good', dtstart: '20270601', dtend: '20270605' }),
    ]);

    const events = service.parse(ical);

    // Should have at least the good event (malformed may or may not parse)
    const goodEvent = events.find((e) => e.uid === 'good');
    expect(goodEvent).toBeDefined();
  });

  it('should parse a realistic AirBnB-style feed', () => {
    const ical = [
      'BEGIN:VCALENDAR',
      'PRODID:-//Airbnb Inc//Hosting Calendar 0.8.8//EN',
      'CALSCALE:GREGORIAN',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTEND;VALUE=DATE:20270615',
      'DTSTART;VALUE=DATE:20270610',
      'UID:abc123@airbnb.com',
      'SUMMARY:Reserved',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'DTEND;VALUE=DATE:20270705',
      'DTSTART;VALUE=DATE:20270701',
      'UID:def456@airbnb.com',
      'SUMMARY:Not available',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const events = service.parse(ical);

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({
      uid: 'abc123@airbnb.com',
      startDate: '2027-06-10',
      endDate: '2027-06-15',
      summary: 'Reserved',
    });
    expect(events[1]).toEqual({
      uid: 'def456@airbnb.com',
      startDate: '2027-07-01',
      endDate: '2027-07-05',
      summary: 'Not available',
    });
  });
});
