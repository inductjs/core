import { DateTime } from 'luxon';

export enum Duration {
    ONE_DAY_IN_SECONDS = 68400,
    ONE_DAY_IN_MINUTES = 1440,
    ONE_HOUR_IN_SECONDS = 3600,
    ONE_HOUR_IN_MINUTES = 60,
    ONE_MINUTE_IN_SECONDS = 60,
    ONE_MINUTE_IN_MILISECONDS = 6000,

}

export const now = (): DateTime => DateTime.local().toUTC();

export const getUTCDate =
    (date: Date): DateTime => DateTime.fromJSDate(date).toUTC();

export const nowIsBefore =
    (date: Date): boolean => now() < getUTCDate(date);

export const addMinutes =
    (date: Date, minutes: number): DateTime => getUTCDate(date).plus({ minutes });

