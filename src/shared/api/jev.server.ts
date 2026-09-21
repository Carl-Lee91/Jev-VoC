import { TypeSafeClient } from "@typesafe-ai/sdk";

import { JEV_TIMEOUT_MS } from "../config/thresholds";
import { withTimeout } from "../lib/with-timeout";
import { VOC_QUESTIONS, type VocAnswers } from "./questions";

/**
 * ⚠️ 서버 전용 모듈. 클라이언트 번들에 절대 들어가면 안 된다.
 *
 * - TYPESAFE_API_KEY 는 NEXT_PUBLIC_ 없이 서버 환경변수로만 읽는다
 * - 이 모듈은 app/api/voc/route.ts 에서만 import 한다
 *   (shared/api/index.ts 에 재노출하지 않는 이유)
 */

export interface JevClassification {
  answers: VocAnswers;
  latencyMs: number;
}

let cachedClient: TypeSafeClient | null = null;

/**
 * 클라이언트를 지연 생성한다. 키가 없으면 생성자가 던지는데, 모듈 로드 시점에
 * 던지면 라우트 자체가 죽으므로 호출 시점에 던지게 해 ESCALATE 폴백으로 흡수한다.
 */
function getClient(): TypeSafeClient {
  cachedClient ??= new TypeSafeClient({ timeout: JEV_TIMEOUT_MS });
  return cachedClient;
}

/** 테스트에서 클라이언트 캐시를 비운다. */
export function resetJevClient(): void {
  cachedClient = null;
}

/**
 * 문의 1건을 Jev 에 던져 4개 질문을 한 번에 판정받는다.
 * 실패·타임아웃은 그대로 던지고, 폴백 판단은 호출자(Route Handler)가 한다.
 */
export async function classifyInquiry(message: string): Promise<JevClassification> {
  const startedAt = Date.now();

  const result = await withTimeout(
    (signal) =>
      getClient().systemOne(
        { state: { document: message }, questions: VOC_QUESTIONS },
        { signal, timeout: JEV_TIMEOUT_MS },
      ),
    JEV_TIMEOUT_MS,
  );

  return { answers: result.answers, latencyMs: Date.now() - startedAt };
}
