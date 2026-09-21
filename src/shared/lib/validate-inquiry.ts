import { INQUIRY_VALIDATION_MESSAGES } from "../config/messages";
import { MESSAGE_MAX_LENGTH, MESSAGE_MIN_LENGTH } from "../config/thresholds";

export type InquiryValidation =
  | { ok: true; message: string }
  | { ok: false; message: string };

/**
 * 문의 입력 검증. 폼과 서버가 같은 규칙을 쓰도록 순수 함수로 둔다.
 * 길이 상한은 원문 기준, 하한은 공백을 제거한 기준으로 본다.
 */
export function validateInquiry(input: unknown): InquiryValidation {
  if (typeof input !== "string") {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.required };
  }

  if (input.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.tooLong };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.required };
  }
  if (trimmed.length < MESSAGE_MIN_LENGTH) {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.tooShort };
  }

  return { ok: true, message: trimmed };
}
