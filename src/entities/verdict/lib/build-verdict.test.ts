import { describe, expect, it } from "vitest";

import type { VocAnswers } from "@/shared/api";
import { NOUL_TRUE_THRESHOLD } from "@/shared/config";

import { buildVerdict, isNoulTrue } from "./build-verdict";

function makeAnswers(overrides: {
  isUrgentNoul?: number;
  needsHumanNoul?: number;
} = {}): VocAnswers {
  return {
    intent: {
      type: "choice",
      choice: "billing",
      confidence: 0.91,
      probabilities: {
        billing: 0.91,
        technical: 0.06,
        account: 0.02,
        shipping: 0.01,
        etc: 0,
      },
    },
    frustration: {
      type: "score",
      score: 1,
      confidence: 0.88,
      legend: {
        0: "Calm. States the facts without emotion.",
        1: "Annoyed or dissatisfied, but still polite.",
        2: "Very angry. Uses strong, aggressive, or threatening language.",
      },
      probabilities: { 0: 0.1, 1: 0.8, 2: 0.1 },
    },
    is_urgent: { type: "noul", noul: overrides.isUrgentNoul ?? 0.9 },
    needs_human: { type: "noul", noul: overrides.needsHumanNoul ?? 0.1 },
  };
}

describe("noul 확률의 boolean 해석", () => {
  it("임계값 이상이면 true 로 해석한다", () => {
    expect(isNoulTrue(NOUL_TRUE_THRESHOLD)).toBe(true);
    expect(isNoulTrue(1)).toBe(true);
  });

  it("임계값 미만이면 false 로 해석한다", () => {
    expect(isNoulTrue(NOUL_TRUE_THRESHOLD - 0.01)).toBe(false);
    expect(isNoulTrue(0)).toBe(false);
  });
});

describe("Jev 원시 답변 정규화 buildVerdict", () => {
  it("choice/score 판정과 응답 시간을 그대로 옮긴다", () => {
    const verdict = buildVerdict(makeAnswers(), 312);

    expect(verdict.intent.choice).toBe("billing");
    expect(verdict.intent.confidence).toBe(0.91);
    expect(verdict.intent.probabilities.billing).toBe(0.91);
    expect(verdict.frustration).toEqual({ score: 1, confidence: 0.88 });
    expect(verdict.latencyMs).toBe(312);
  });

  it("noul 확률을 임계값 기준 boolean 으로 바꾼다", () => {
    const verdict = buildVerdict(
      makeAnswers({ isUrgentNoul: 0.9, needsHumanNoul: 0.1 }),
      100,
    );

    expect(verdict.isUrgent).toBe(true);
    expect(verdict.needsHuman).toBe(false);
  });

  it("probabilities 를 복사해 원본 응답과 참조를 공유하지 않는다", () => {
    const answers = makeAnswers();
    const verdict = buildVerdict(answers, 100);

    expect(verdict.intent.probabilities).not.toBe(answers.intent.probabilities);
    expect(verdict.intent.probabilities).toEqual(answers.intent.probabilities);
  });
});
