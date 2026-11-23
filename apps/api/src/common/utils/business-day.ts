// shortcut: one fixed business timezone (WIB, UTC+7, no DST) for every merchant;
// switch to a per-outlet timezone once outlets outside WIB exist.
export const BUSINESS_TZ_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Business-day key (YYYY-MM-DD, WIB) of an instant */
export const businessDayKey = (d: Date): string =>
  new Date(d.getTime() + BUSINESS_TZ_OFFSET_MS).toISOString().slice(0, 10);

/** [from, to) instants of a WIB business day given as YYYY-MM-DD */
export const businessDayRange = (date: string) => {
  const from = new Date(Date.parse(date) - BUSINESS_TZ_OFFSET_MS);
  return { from, to: new Date(from.getTime() + DAY_MS) };
};

/** 00:00 WIB of the business day that contains `now` */
export const startOfBusinessDay = (now = new Date()): Date =>
  businessDayRange(businessDayKey(now)).from;
