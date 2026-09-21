import * as yup from "yup";

import {
  INQUIRY_VALIDATION_MESSAGES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from "@/shared/config";

/** 문의 입력 폼 검증 규칙 (docs/02-화면명세서.md S-01) */
export const inquirySchema = yup.object({
  // 빈 값은 필수 문구가 먼저 나와야 하므로 required 를 가장 앞에 둔다.
  message: yup
    .string()
    .trim()
    .required(INQUIRY_VALIDATION_MESSAGES.required)
    .min(MESSAGE_MIN_LENGTH, INQUIRY_VALIDATION_MESSAGES.tooShort)
    .max(MESSAGE_MAX_LENGTH, INQUIRY_VALIDATION_MESSAGES.tooLong),
});

export type InquiryFormValues = yup.InferType<typeof inquirySchema>;
