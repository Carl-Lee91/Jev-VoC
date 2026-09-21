import { describe, expect, it } from "vitest";

import { INTENTS } from "../model/voc";
import { FAQ_TEMPLATES, getFaqReply } from "./faq";

describe("FAQ 템플릿 매칭", () => {
  it("TC-U-16: 5개 의도 전부 비어있지 않은 템플릿을 가진다", () => {
    expect(Object.keys(FAQ_TEMPLATES)).toHaveLength(INTENTS.length);

    for (const intent of INTENTS) {
      expect(FAQ_TEMPLATES[intent].trim().length).toBeGreaterThan(0);
    }
  });

  it("TC-U-16: getFaqReply 는 알려진 의도에 대해 템플릿 문자열을 반환한다", () => {
    for (const intent of INTENTS) {
      expect(getFaqReply(intent)).toBe(FAQ_TEMPLATES[intent]);
    }
  });

  it("TC-U-17: 알 수 없는 키를 조회하면 예외 없이 null 을 반환한다", () => {
    expect(() => getFaqReply("unknown-intent")).not.toThrow();
    expect(getFaqReply("unknown-intent")).toBeNull();
    expect(getFaqReply("")).toBeNull();
  });
});
