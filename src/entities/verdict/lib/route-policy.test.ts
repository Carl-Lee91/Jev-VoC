import { describe, expect, it } from "vitest";

import { CONFIDENCE_THRESHOLD } from "@/shared/config";
import type { Intent } from "@/shared/model";

import type { JevVerdict } from "../model/types";
import { resolveAction } from "./route-policy";

interface VerdictOverrides {
  choice?: Intent;
  confidence?: number;
  probabilities?: Record<string, number>;
  frustration?: number;
  isUrgent?: boolean;
  needsHuman?: boolean;
}

function makeVerdict(overrides: VerdictOverrides = {}): JevVerdict {
  const choice = overrides.choice ?? "billing";
  return {
    intent: {
      choice,
      confidence: overrides.confidence ?? 0.91,
      probabilities: overrides.probabilities ?? {
        billing: 0.91,
        technical: 0.06,
        account: 0.02,
        shipping: 0.01,
        etc: 0,
      },
    },
    frustration: { score: overrides.frustration ?? 0, confidence: 0.88 },
    isUrgent: overrides.isUrgent ?? false,
    needsHuman: overrides.needsHuman ?? false,
    latencyMs: 312,
  };
}

describe("라우팅 정책 resolveAction", () => {
  it("TC-U-01: Jev 호출에 실패해 판정이 없으면 규칙 1로 이관하고 우선순위는 normal 이다", () => {
    const decision = resolveAction(null);

    expect(decision.action).toBe("ESCALATE");
    expect(decision.priority).toBe("normal");
    expect(decision.reason).toContain("규칙 1");
  });

  it("TC-U-02: 불만도가 최고 레벨이면 즉시 이관하고 우선순위가 high 가 된다", () => {
    const decision = resolveAction(makeVerdict({ frustration: 2, confidence: 0.99 }));

    expect(decision.action).toBe("ESCALATE");
    expect(decision.priority).toBe("high");
    expect(decision.reason).toContain("규칙 2");
  });

  it("TC-U-03: 불만도 최고 레벨은 높은 confidence 를 이긴다", () => {
    const decision = resolveAction(
      makeVerdict({ frustration: 2, confidence: 0.99, choice: "billing" }),
    );

    expect(decision.action).not.toBe("AUTO_REPLY");
    expect(decision.action).toBe("ESCALATE");
  });

  it("TC-U-04: 사람 상담원이 필요하다고 판정되면 confidence 가 높아도 이관한다", () => {
    const decision = resolveAction(makeVerdict({ needsHuman: true, confidence: 0.95 }));

    expect(decision.action).toBe("ESCALATE");
    expect(decision.reason).toContain("규칙 3");
  });

  it("TC-U-05: confidence 가 임계값 미만이면 되묻는다", () => {
    const decision = resolveAction(makeVerdict({ confidence: 0.69 }));

    expect(decision.action).toBe("CLARIFY");
    expect(decision.reason).toContain("규칙 4");
  });

  it("TC-U-06: confidence 가 임계값과 같으면 통과해 자동응답한다", () => {
    const decision = resolveAction(makeVerdict({ confidence: CONFIDENCE_THRESHOLD }));

    expect(decision.action).toBe("AUTO_REPLY");
  });

  it("TC-U-07: 의도가 etc 면 confidence 가 높아도 되묻는다", () => {
    const decision = resolveAction(makeVerdict({ choice: "etc", confidence: 0.95 }));

    expect(decision.action).toBe("CLARIFY");
    expect(decision.reason).toContain("규칙 5");
  });

  it("TC-U-08: 임계값을 넘긴 일반 문의는 자동응답한다", () => {
    const decision = resolveAction(
      makeVerdict({ choice: "billing", confidence: 0.91, frustration: 1 }),
    );

    expect(decision.action).toBe("AUTO_REPLY");
    expect(decision.priority).toBe("normal");
    expect(decision.reason).toContain("규칙 6");
  });

  it("TC-U-09: 긴급 판정은 분기를 바꾸지 않는다", () => {
    const decision = resolveAction(makeVerdict({ isUrgent: true, confidence: 0.91 }));

    expect(decision.action).toBe("AUTO_REPLY");
  });

  it("TC-U-10: 긴급 판정은 우선순위만 high 로 올린다", () => {
    const urgent = resolveAction(makeVerdict({ isUrgent: true, confidence: 0.91 }));
    const normal = resolveAction(makeVerdict({ isUrgent: false, confidence: 0.91 }));

    expect(urgent.action).toBe("AUTO_REPLY");
    expect(urgent.priority).toBe("high");
    expect(normal.priority).toBe("normal");
  });

  it("TC-U-11: 모든 분기가 적용된 규칙 번호가 담긴 reason 을 반환한다", () => {
    const decisions = [
      resolveAction(null),
      resolveAction(makeVerdict({ frustration: 2 })),
      resolveAction(makeVerdict({ needsHuman: true })),
      resolveAction(makeVerdict({ confidence: 0.1 })),
      resolveAction(makeVerdict({ choice: "etc" })),
      resolveAction(makeVerdict()),
    ];

    for (const decision of decisions) {
      expect(decision.reason.trim()).not.toBe("");
      expect(decision.reason).toMatch(/규칙 [1-6]/);
    }
  });
});

describe("라우팅 정책 경계값과 방어 로직", () => {
  it("TC-U-12: confidence 가 0 이면 되묻는다", () => {
    expect(resolveAction(makeVerdict({ confidence: 0 })).action).toBe("CLARIFY");
  });

  it("TC-U-13: confidence 가 1 이면 자동응답한다", () => {
    expect(resolveAction(makeVerdict({ confidence: 1 })).action).toBe("AUTO_REPLY");
  });

  it("TC-U-14: probabilities 가 빈 객체여도 예외 없이 되묻기로 폴백한다", () => {
    const verdict = makeVerdict({ probabilities: {}, confidence: 0.95 });

    expect(() => resolveAction(verdict)).not.toThrow();
    expect(resolveAction(verdict).action).toBe("CLARIFY");
  });

  it("TC-U-15: 스펙에 없는 의도 값을 받아도 예외 없이 되묻기로 폴백한다", () => {
    // 런타임에는 타입 밖 문자열이 올 수 있으므로 단언으로 그 상황을 재현한다.
    const verdict = makeVerdict({ choice: "refund" as Intent, confidence: 0.95 });

    expect(() => resolveAction(verdict)).not.toThrow();
    expect(resolveAction(verdict).action).toBe("CLARIFY");
    expect(resolveAction(verdict).reason).toContain("규칙 5");
  });

  it("confidence 가 NaN 이어도 자동응답으로 새지 않는다", () => {
    expect(resolveAction(makeVerdict({ confidence: Number.NaN })).action).toBe("CLARIFY");
  });
});
