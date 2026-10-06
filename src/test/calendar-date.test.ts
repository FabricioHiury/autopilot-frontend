import { describe, expect, it } from 'vitest';
import handleDate from '@/utils/classes/format/time';

describe('calendar dates', () => {
  it.each(['1990-01-01', '2026-03-29', '2026-10-25'])('preserves %s stored at UTC midnight', (day) => {
    expect(handleDate.formatISODate(`${day}T00:00:00.000Z`, 'yyyy-MM-dd')).toBe(day);
  });
  it('formats without mutating the supplied Date', () => {
    const date = new Date(2026, 9, 6, 12);
    const timestamp = date.getTime();
    expect(handleDate.formatDate(date)).toBe('06/10/2026');
    expect(date.getTime()).toBe(timestamp);
  });
});
