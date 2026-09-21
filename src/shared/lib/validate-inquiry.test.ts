import { describe, expect, it } from "vitest";

import { INQUIRY_VALIDATION_MESSAGES } from "../config/messages";
import { MESSAGE_MAX_LENGTH } from "../config/thresholds";
import { validateInquiry } from "./validate-inquiry";

describe("문의 입력 검증", () => {
  it("문자열이 아니면 필수 입력 문구를 돌려준다", () => {
    expect(validateInquiry(undefined)).toEqual({
      ok: false,
      message: INQUIRY_VALIDATION_MESSAGES.required,
    });
    expect(validateInquiry(42).ok).toBe(false);
  });

  it("빈 문자열과 공백만 있는 입력은 필수 입력으로 막는다", () => {
    expect(validateInquiry("")).toEqual({
      ok: false,
      message: INQUIRY_VALIDATION_MESSAGES.required,
    });
    expect(validateInquiry("   ")).toEqual({
      ok: false,
      message: INQUIRY_VALIDATION_MESSAGES.required,
    });
  });

  it("공백 제거 후 2자 미만이면 최소 길이 문구를 돌려준다", () => {
    expect(validateInquiry("가")).toEqual({
      ok: false,
      message: INQUIRY_VALIDATION_MESSAGES.tooShort,
    });
  });

  it("2000자를 넘기면 최대 길이 문구를 돌려준다", () => {
    expect(validateInquiry("가".repeat(MESSAGE_MAX_LENGTH + 1))).toEqual({
      ok: false,
      message: INQUIRY_VALIDATION_MESSAGES.tooLong,
    });
  });

  it("경계값인 2자와 2000자는 통과시킨다", () => {
    expect(validateInquiry("결제").ok).toBe(true);
    expect(validateInquiry("가".repeat(MESSAGE_MAX_LENGTH)).ok).toBe(true);
  });

  it("통과한 입력은 앞뒤 공백을 제거해 돌려준다", () => {
    expect(validateInquiry("  결제가 두 번 됐어요  ")).toEqual({
      ok: true,
      message: "결제가 두 번 됐어요",
    });
  });
});
