import { TIMEZONE } from "./constants.js";

// Current { year, month } in Kabul time (month is 1-12)
export const getKabulYearMonth = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);
  return {
    year: Number(parts.find((p) => p.type === "year").value),
    month: Number(parts.find((p) => p.type === "month").value),
  };
};

// "2026-09-25 14:30" in Kabul time
export const formatKabul = (date) =>
  date
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: TIMEZONE,
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(date))
    : "";

export const percentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : null; // null = not comparable
  return Math.round(((current - previous) / previous) * 100);
};
