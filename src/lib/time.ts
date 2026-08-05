import { DateTime } from 'luxon';

export type WeekdayKey = keyof typeof OPENING_HOURS;

const OPENING_HOURS = {
  mon: ['09:00', '17:00'],
  tue: ['09:00', '17:00'],
  wed: ['09:00', '17:00'],
  thu: ['09:00', '17:00'],
  fri: ['09:00', '17:00'],
  sat: ['10:00', '14:00'],
  sun: [],
};

export function getDayKey(dateIso: string, timezone: string): WeekdayKey {
  const dayNumber = DateTime.fromISO(dateIso, { zone: timezone }).weekday;
  const map: Record<number, WeekdayKey> = {
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
    7: 'sun',
  };
  return map[dayNumber];
}

export function getDayHours(dateIso: string, timezone: string): [string, string] | [] {
  return OPENING_HOURS[getDayKey(dateIso, timezone)] as [string, string] | [];
}

export function isTimeZoneValid(timezone: string): boolean {
  try {
    return DateTime.now().setZone(timezone).isValid;
  } catch {
    return false;
  }
}

export function isIsoDateValid(dateIso: string): boolean {
  const parsed = DateTime.fromISO(dateIso, { zone: 'UTC' });
  return parsed.isValid && parsed.toISODate() === dateIso;
}

export function minutesFromTime(time: string): number {
  const [hour, minute] = time.split(':').map((value) => Number(value));
  return hour * 60 + minute;
}

export function parseLocalTimeToUtc(dateIso: string, localTime: string, timezone: string): Date {
  const [hour, minute] = localTime.split(':').map((item) => Number(item));

  return DateTime.fromObject(
    {
      year: Number(dateIso.slice(0, 4)),
      month: Number(dateIso.slice(5, 7)),
      day: Number(dateIso.slice(8, 10)),
      hour,
      minute,
      second: 0,
      millisecond: 0,
    },
    { zone: timezone }
  ).toUTC().toJSDate();
}

export function formatSlotLabel(utcDate: Date, timezone: string): string {
  return DateTime.fromJSDate(utcDate).setZone(timezone).toFormat('EEE, MMM d · h:mm a');
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}

export function isPast(date: Date, leadMinutes = 0): boolean {
  return date.getTime() <= Date.now() + leadMinutes * 60_000;
}
