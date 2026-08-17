export function formatSignTimestamp(date = new Date()) {
  // e.g. 2026-08-17 14:32:05 +07:00
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  const tzOffsetMin = -date.getTimezoneOffset();
  const sign = tzOffsetMin >= 0 ? "+" : "-";
  const tzH = pad(Math.floor(Math.abs(tzOffsetMin) / 60));
  const tzM = pad(Math.abs(tzOffsetMin) % 60);

  return `${y}-${m}-${d} ${hh}:${mm}:${ss} ${sign}${tzH}:${tzM}`;
}
