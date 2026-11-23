import { ReportsService } from './reports.service';
import { businessDayKey } from '../common/utils/business-day';

const svc = () => new ReportsService({} as any, {} as any);

describe('reports business day (WIB)', () => {
  it('groups a 01:00 WIB sale into its own WIB day, not the previous UTC day', () => {
    // 2026-11-22T18:00Z === 2026-11-23 01:00 WIB
    expect(businessDayKey(new Date('2026-11-22T18:00:00Z'))).toBe('2026-11-23');
    // 2026-11-23T16:59Z === 23:59 WIB, still the 23rd
    expect(businessDayKey(new Date('2026-11-23T16:59:59Z'))).toBe('2026-11-23');
  });

  it('date-only range covers 00:00–23:59:59.999 WIB', () => {
    const s = svc() as any;
    expect(s.parseDate('2026-11-23').toISOString()).toBe(
      '2026-11-22T17:00:00.000Z',
    );
    expect(s.parseDateEnd('2026-11-23').toISOString()).toBe(
      '2026-11-23T16:59:59.999Z',
    );
  });

  it('leaves full ISO timestamps untouched', () => {
    const s = svc() as any;
    expect(s.parseDate('2026-11-23T05:00:00.000Z').toISOString()).toBe(
      '2026-11-23T05:00:00.000Z',
    );
    expect(s.parseDateEnd(undefined)).toBeUndefined();
  });
});
