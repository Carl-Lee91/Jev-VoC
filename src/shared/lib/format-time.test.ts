import { describe, expect, it } from "vitest";

import { formatClockTime } from "./format-time";

describe("시각 표시 형식", () => {
  it("ISO 문자열을 HH:mm:ss 로 바꾼다", () => {
    const iso = new Date(2026, 8, 21, 9, 5, 3).toISOString();

    expect(formatClockTime(iso)).toBe("09:05:03");
  });

  it("파싱할 수 없는 값이면 예외 없이 자리표시자를 반환한다", () => {
    expect(() => formatClockTime("어제")).not.toThrow();
    expect(formatClockTime("어제")).toBe("--:--:--");
  });
});
