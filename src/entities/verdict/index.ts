export { buildVerdict, isNoulTrue } from "./lib/build-verdict";
export { resolveAction } from "./lib/route-policy";
export type { RouteDecision } from "./model/types";
// 판정 데이터 타입은 shared 에 선언돼 있지만, 소비자는 이 슬라이스를 통해 쓴다.
export type { FrustrationVerdict, IntentVerdict, JevVerdict } from "@/shared/model";
