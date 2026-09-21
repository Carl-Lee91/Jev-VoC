/** 제한 시간을 넘긴 작업에 대해 던지는 에러 */
export class TimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`작업이 ${timeoutMs}ms 안에 끝나지 않았다`);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/**
 * 총 제한 시간을 보장한다.
 *
 * SDK 의 timeout 옵션은 "시도 1회" 기준이라 재시도가 붙으면 총 소요가 늘어난다.
 * 여기서 AbortSignal 로 취소를 전파하고, 취소를 무시하는 구현에 대비해
 * 경주(race)로 한 번 더 막는다.
 */
export async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const expiry = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([run(controller.signal), expiry]);
  } finally {
    clearTimeout(timer);
  }
}
