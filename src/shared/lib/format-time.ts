const TIME_PAD = 2;

/** ISO 문자열을 로컬 시각 HH:mm:ss 로 만든다. 파싱에 실패하면 "--:--:--". */
export function formatClockTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "--:--:--";
  }
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => String(part).padStart(TIME_PAD, "0"))
    .join(":");
}
