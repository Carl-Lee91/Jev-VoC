import type { Intent } from "./voc";

/**
 * Jev 판정 결과의 데이터 형태.
 *
 * 해석·라우팅 로직은 entities/verdict 가 소유하지만, entities/ticket 도 티켓에
 * 판정을 실어야 한다. 같은 레이어 슬라이스끼리는 직접 import 할 수 없으므로
 * 데이터 타입만 shared 에 두고 entities/verdict 의 index 에서 다시 노출한다.
 */

/** intent 질문(choice)의 판정 결과 */
export interface IntentVerdict {
  choice: Intent;
  confidence: number;
  probabilities: Record<string, number>;
}

/** frustration 질문(score)의 판정 결과. score 는 기대값이라 정수가 아닐 수 있다. */
export interface FrustrationVerdict {
  score: number;
  confidence: number;
}

/** 정규화된 Jev 판정 (docs/01-기획명세서.md 6) */
export interface JevVerdict {
  intent: IntentVerdict;
  frustration: FrustrationVerdict;
  isUrgent: boolean;
  needsHuman: boolean;
  latencyMs: number;
}
