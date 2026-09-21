import type { Intent, Priority, RouteAction } from "../model/voc";

/** 의도 한글 라벨 */
export const INTENT_LABELS: Record<Intent, string> = {
  billing: "결제",
  technical: "기술",
  account: "계정",
  shipping: "배송",
  etc: "기타",
};

/** 의도별 배지 색상. Tailwind 가 클래스를 정적으로 찾아야 해서 전체 문자열로 둔다. */
export const INTENT_BADGE_CLASS: Record<Intent, string> = {
  billing: "bg-intent-billing-soft text-intent-billing border-intent-billing-soft",
  technical:
    "bg-intent-technical-soft text-intent-technical border-intent-technical-soft",
  account: "bg-intent-account-soft text-intent-account border-intent-account-soft",
  shipping:
    "bg-intent-shipping-soft text-intent-shipping border-intent-shipping-soft",
  etc: "bg-intent-etc-soft text-intent-etc border-intent-etc-soft",
};

/** 처리 유형 한글 라벨 */
export const ACTION_LABELS: Record<RouteAction, string> = {
  AUTO_REPLY: "자동응답",
  CLARIFY: "되묻기",
  ESCALATE: "이관",
};

/** 우선순위 한글 라벨 */
export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "높음",
  normal: "보통",
  low: "낮음",
};

/** 불만도 레벨 설명 (인스펙터 세그먼트 바 툴팁) */
export const FRUSTRATION_LABELS = ["차분함", "불만", "매우 화남"] as const;

/** 최초 진입 화면에 띄우는 예시 문의 칩 */
export const EXAMPLE_INQUIRIES = [
  "결제가 두 번 됐어요. 빨리 처리해주세요",
  "로그인하면 자꾸 오류가 나요",
  "주문한 상품 언제 배송되나요?",
] as const;

/** 되묻기 카드에서 제시할 의도 후보 */
export const CLARIFY_INTENT_CHOICES: Intent[] = ["billing", "technical", "shipping"];
