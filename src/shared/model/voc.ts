/**
 * VOC 도메인의 기본 타입.
 *
 * entities/verdict 와 entities/ticket 은 같은 레이어라 서로 import 할 수 없으므로,
 * 두 슬라이스가 공유하는 원시 타입은 shared 에 둔다. (docs/02-화면명세서.md 1.2)
 */

/** 문의 의도 분류 결과 */
export type Intent = "billing" | "technical" | "account" | "shipping" | "etc";

/** 라우팅 정책이 결정한 처리 방식 */
export type RouteAction = "AUTO_REPLY" | "CLARIFY" | "ESCALATE";

/** 티켓 우선순위 */
export type Priority = "low" | "normal" | "high";

/** Jev intent 질문의 선택지 목록 (FAQ 키와 1:1 대응) */
export const INTENTS = [
  "billing",
  "technical",
  "account",
  "shipping",
  "etc",
] as const satisfies readonly Intent[];

/** 처리 방식 목록 (티켓 필터 UI 등에서 사용) */
export const ROUTE_ACTIONS = [
  "AUTO_REPLY",
  "CLARIFY",
  "ESCALATE",
] as const satisfies readonly RouteAction[];

/** 임의의 문자열이 알려진 Intent 인지 판별한다. */
export function isIntent(value: string): value is Intent {
  return (INTENTS as readonly string[]).includes(value);
}
