import {
  choice,
  noul,
  score,
  type Questions,
  type SystemOneResult,
} from "@typesafe-ai/sdk";

/**
 * Jev 에 던지는 VOC 판정 질문 4개.
 *
 * 4개를 한 번의 systemOne 호출로 병렬 판정한다. (docs/01-기획명세서.md 5.2)
 * 시그니처는 node_modules/@typesafe-ai/sdk/dist/index.d.mts 에서 직접 확인했다.
 *   choice(instructions, criteria: { [label]: description | null })
 *   score(instructions, criteria: readonly [설명0, 설명1, ...])  // 인덱스가 곧 점수
 *   noul(instructions?, criteria?: { true?, false? })
 *
 * 고객 입력은 한국어지만 질문·기준은 모델에게 주는 내부 프롬프트라 영어로 쓴다.
 */
export const VOC_QUESTIONS = {
  intent: choice("What is this customer support inquiry about?", {
    billing: "Payments, refunds, duplicate charges, subscriptions, pricing.",
    technical:
      "Errors, bugs, crashes, broken features, integration or connection failures.",
    account: "Account access, login, password, profile changes, withdrawal.",
    shipping: "Delivery status, exchange, or return of an ordered item.",
    etc: "None of the other categories apply.",
  }),
  frustration: score("How frustrated does the customer sound?", [
    "Calm. States the facts without emotion.",
    "Annoyed or dissatisfied, but still polite.",
    "Very angry. Uses strong, aggressive, or threatening language.",
  ]),
  is_urgent: noul("Is this inquiry time-sensitive?", {
    true: "The customer is blocked right now or asks for immediate handling.",
    false: "The inquiry can be handled within normal response times.",
  }),
  needs_human: noul("Does this inquiry require a human agent?", {
    true: "It needs judgment, an exception, compensation, or account-specific action.",
    false: "A standard FAQ answer fully resolves it.",
  }),
} satisfies Questions;

export type VocQuestions = typeof VOC_QUESTIONS;

/** Jev 가 돌려주는 원시 답변 묶음 (질문 스키마에서 타입이 추론된다) */
export type VocAnswers = SystemOneResult<VocQuestions>["answers"];
