export class InputError extends Error {}

export type BookingValues = {
  equipmentId: string;
  borrowerName: string;
  startAt: number;
  endAt: number;
  purpose: string;
};

const fields = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose'];

// Check the calendar components before Date.parse can normalize impossible dates.
function timestamp(value: unknown, field: string): number {
  if (typeof value !== 'string') throw new InputError(`${field} must be a timestamp string`);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) throw new InputError(`${field} must be an ISO timestamp with an explicit timezone`);
  const [, y, mo, d, h, mi, s, , zone] = match;
  const year = Number(y), month = Number(mo), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1] ||
      Number(h) > 23 || Number(mi) > 59 || Number(s) > 59 ||
      (zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59))) {
    throw new InputError(`${field} must contain a valid calendar date and time`);
  }
  const instant = Date.parse(value);
  if (!Number.isFinite(instant)) throw new InputError(`${field} must be a valid timestamp`);
  return instant;
}

export function validateBooking(body: unknown, existing?: BookingValues): BookingValues {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new InputError('Request body must be a JSON object');
  const input = body as Record<string, unknown>;
  const keys = Object.keys(input);
  if (keys.length === 0) throw new InputError('Request body must contain booking fields');
  if (keys.some(key => !fields.includes(key))) throw new InputError('Request body contains unknown fields');
  const merged: Record<string, unknown> = existing ? {
    ...existing, startAt: new Date(existing.startAt).toISOString(), endAt: new Date(existing.endAt).toISOString(), ...input
  } : input;
  const text = (field: string) => {
    const value = merged[field];
    if (typeof value !== 'string' || !value.trim()) throw new InputError(`${field} must be a non-empty string`);
    return value.trim();
  };
  const result = {
    equipmentId: text('equipmentId'), borrowerName: text('borrowerName'), purpose: text('purpose'),
    startAt: timestamp(merged.startAt, 'startAt'), endAt: timestamp(merged.endAt, 'endAt')
  };
  if (result.startAt >= result.endAt) throw new InputError('startAt must be before endAt');
  return result;
}
