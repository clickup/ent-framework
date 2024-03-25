let prevDate: Date | null = null;

export function formatTimeWithMs(date: Date, withDelta = false): string {
  const h = date.getHours().toString();
  const m = date.getMinutes().toString();
  const s = date.getSeconds().toString();
  const ms = date.getMilliseconds().toString();

  let deltaMs: number | null = null;
  if (withDelta) {
    deltaMs = prevDate ? date.getTime() - prevDate.getTime() : 0;
    prevDate = date;
  }

  return (
    `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}.${ms.padStart(3, "0")}` +
    (deltaMs !== null ? " in " + `${deltaMs}ms`.padStart(7) : "")
  );
}
