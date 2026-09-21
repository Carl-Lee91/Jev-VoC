import { describe, expect, it } from "vitest";

import { CONFIDENCE_THRESHOLD } from "@/shared/config";

import { isConfidencePassing, sortProbabilities } from "./interpret";

describe("confidence 해석", () => {
  it("임계값과 같거나 크면 통과로 본다", () => {
    expect(isConfidencePassing(CONFIDENCE_THRESHOLD)).toBe(true);
    expect(isConfidencePassing(1)).toBe(true);
  });

  it("임계값보다 작으면 미달로 본다", () => {
    expect(isConfidencePassing(CONFIDENCE_THRESHOLD - 0.01)).toBe(false);
    expect(isConfidencePassing(0)).toBe(false);
  });
});

describe("확률 정렬", () => {
  it("확률이 큰 순서대로 정렬한다", () => {
    const sorted = sortProbabilities({ billing: 0.1, technical: 0.8, etc: 0.1 });

    expect(sorted.map((entry) => entry.label)).toEqual([
      "technical",
      "billing",
      "etc",
    ]);
    expect(sorted[0].value).toBe(0.8);
  });

  it("확률이 같으면 라벨 사전순으로 안정화한다", () => {
    const sorted = sortProbabilities({ shipping: 0.5, account: 0.5 });

    expect(sorted.map((entry) => entry.label)).toEqual(["account", "shipping"]);
  });

  it("빈 객체면 빈 배열을 반환한다", () => {
    expect(sortProbabilities({})).toEqual([]);
  });
});
