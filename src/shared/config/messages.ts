import { MESSAGE_MAX_LENGTH, MESSAGE_MIN_LENGTH } from "./thresholds";

/**
 * 입력 검증 문구. 서버(Route Handler)와 폼(Yup)이 같은 문구를 쓴다.
 * (docs/02-화면명세서.md S-01 입력 폼 검증)
 */
export const INQUIRY_VALIDATION_MESSAGES = {
  required: "문의 내용을 입력해주세요",
  tooShort: `${MESSAGE_MIN_LENGTH}자 이상 입력해주세요`,
  tooLong: `${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요`,
} as const;
