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

/**
 * 화면에 나가는 고정 문구.
 * Jev 는 문장을 만들지 않으므로 답변 외 안내 문구도 전부 여기에 둔다.
 */
export const CHAT_COPY = {
  greeting: "안녕하세요. 무엇을 도와드릴까요? 아래 예시처럼 문의를 남겨주세요.",
  clarifyPrompt: "조금 더 자세히 알려주시겠어요?",
  clarifyHint: "어떤 종류의 문의인지 골라주시면 더 빠르게 안내해 드릴 수 있어요.",
  escalateTitle: "상담원에게 연결해 드릴게요",
  escalateHint: "접수된 내용을 상담원이 확인하고 순차적으로 답변드립니다.",
  apiError: "일시적인 오류가 발생했어요. 상담원에게 연결해 드릴게요.",
  urgentBadge: "우선 처리 요청됨",
  typing: "상담봇이 판정 중입니다",
} as const;
