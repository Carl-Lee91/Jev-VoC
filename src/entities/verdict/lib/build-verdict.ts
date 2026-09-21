import type { VocAnswers } from "@/shared/api";
import { NOUL_TRUE_THRESHOLD } from "@/shared/config";

import type { JevVerdict } from "../model/types";

/** noul 은 yes 확률(0~1)로 오므로 임계값으로 boolean 해석한다. */
export function isNoulTrue(noulProbability: number): boolean {
  return noulProbability >= NOUL_TRUE_THRESHOLD;
}

/** Jev 원시 답변을 앱이 쓰는 JevVerdict 로 정규화한다. */
export function buildVerdict(answers: VocAnswers, latencyMs: number): JevVerdict {
  return {
    intent: {
      choice: answers.intent.choice,
      confidence: answers.intent.confidence,
      probabilities: { ...answers.intent.probabilities },
    },
    frustration: {
      score: answers.frustration.score,
      confidence: answers.frustration.confidence,
    },
    isUrgent: isNoulTrue(answers.is_urgent.noul),
    needsHuman: isNoulTrue(answers.needs_human.noul),
    latencyMs,
  };
}
