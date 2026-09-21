import { afterEach, describe, expect, it, vi } from "vitest";

import { TimeoutError, withTimeout } from "./with-timeout";

afterEach(() => {
  vi.useRealTimers();
});

describe("총 제한 시간 보장 withTimeout", () => {
  it("제한 시간 안에 끝나면 결과를 그대로 돌려준다", async () => {
    await expect(withTimeout(async () => "완료", 1_000)).resolves.toBe("완료");
  });

  it("제한 시간을 넘기면 TimeoutError 를 던진다", async () => {
    vi.useFakeTimers();

    const pending = withTimeout(() => new Promise<string>(() => {}), 5_000);
    const assertion = expect(pending).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(5_000);

    await assertion;
  });

  it("제한 시간을 넘기면 전달한 신호를 취소한다", async () => {
    vi.useFakeTimers();
    let captured: AbortSignal | undefined;

    const pending = withTimeout((signal) => {
      captured = signal;
      return new Promise<string>(() => {});
    }, 5_000);
    const assertion = expect(pending).rejects.toThrow(TimeoutError);
    await vi.advanceTimersByTimeAsync(5_000);
    await assertion;

    expect(captured?.aborted).toBe(true);
  });

  it("작업이 던진 에러는 그대로 전파한다", async () => {
    await expect(
      withTimeout(async () => {
        throw new Error("작업 실패");
      }, 1_000),
    ).rejects.toThrow("작업 실패");
  });
});
