import type { Intent, Priority, RouteAction } from "@/shared/model";

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

/** Jev 판정 결과를 앱이 쓰는 형태로 정규화한 것 (docs/01-기획명세서.md 6) */
export interface JevVerdict {
  intent: IntentVerdict;
  frustration: FrustrationVerdict;
  isUrgent: boolean;
  needsHuman: boolean;
  latencyMs: number;
}

/** 라우팅 정책의 판단 결과. reason 은 인스펙터에 그대로 노출된다. */
export interface RouteDecision {
  action: RouteAction;
  priority: Priority;
  reason: string;
}
