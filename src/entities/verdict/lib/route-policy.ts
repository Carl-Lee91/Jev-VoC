import { CONFIDENCE_THRESHOLD, FRUSTRATION_ESCALATE_LEVEL } from "@/shared/config";
import {
  isIntent,
  type IntentVerdict,
  type JevVerdict,
  type Priority,
} from "@/shared/model";

import type { RouteDecision } from "../model/types";

/**
 * 라우팅 정책 (docs/01-기획명세서.md 5.4)
 *
 * 우선순위대로 평가하며 먼저 걸리는 규칙이 이긴다.
 * UI 에서 호출하지 말고, 이 순수 함수의 결과만 렌더한다.
 */
export function resolveAction(verdict: JevVerdict | null): RouteDecision {
  if (verdict === null) {
    return {
      action: "ESCALATE",
      priority: "normal",
      reason: "규칙 1: Jev 호출 실패 → 안전 폴백으로 이관",
    };
  }

  const priority = resolvePriority(verdict);

  if (verdict.frustration.score >= FRUSTRATION_ESCALATE_LEVEL) {
    return {
      action: "ESCALATE",
      priority,
      reason: `규칙 2: 불만도 최고 레벨(${verdict.frustration.score}) → 즉시 이관`,
    };
  }

  if (verdict.needsHuman) {
    return {
      action: "ESCALATE",
      priority,
      reason: "규칙 3: 사람 상담원이 필요한 문의 → 이관",
    };
  }

  if (!(verdict.intent.confidence >= CONFIDENCE_THRESHOLD)) {
    return {
      action: "CLARIFY",
      priority,
      reason: `규칙 4: confidence 미달(${verdict.intent.confidence} < ${CONFIDENCE_THRESHOLD}) → 되묻기`,
    };
  }

  const unclassifiedReason = findUnclassifiedReason(verdict.intent);
  if (unclassifiedReason !== null) {
    return { action: "CLARIFY", priority, reason: unclassifiedReason };
  }

  return {
    action: "AUTO_REPLY",
    priority,
    reason: `규칙 6: 임계값 통과(${verdict.intent.confidence} ≥ ${CONFIDENCE_THRESHOLD}) → 자동응답`,
  };
}

/**
 * 우선순위 계산. is_urgent 는 분기를 바꾸지 않고 우선순위만 올린다.
 * (docs/01-기획명세서.md 5.4 각주)
 */
function resolvePriority(verdict: JevVerdict): Priority {
  if (verdict.frustration.score >= FRUSTRATION_ESCALATE_LEVEL) {
    return "high";
  }
  if (verdict.isUrgent) {
    return "high";
  }
  return "normal";
}

/**
 * 규칙 5 — 의도를 신뢰할 수 없는 경우의 사유를 돌려준다. 신뢰 가능하면 null.
 * 스펙상 etc 뿐이지만, 스펙 밖 응답이 와도 던지지 않고 되묻기로 폴백한다.
 */
function findUnclassifiedReason(intent: IntentVerdict): string | null {
  if (Object.keys(intent.probabilities).length === 0) {
    return "규칙 5: 판정 확률이 비어있음 → 되묻기";
  }
  if (!isIntent(intent.choice)) {
    return `규칙 5: 알 수 없는 의도(${intent.choice}) → 되묻기`;
  }
  if (intent.choice === "etc") {
    return "규칙 5: 의도가 etc → 되묻기";
  }
  return null;
}
