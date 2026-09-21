import type { Page } from "@playwright/test";

/**
 * E2E 에서는 Jev 응답을 네트워크 인터셉트로 고정한다.
 * (docs/03-테스트케이스.md 7)
 */
export interface VocStub {
  ticketId: string;
  action: "AUTO_REPLY" | "CLARIFY" | "ESCALATE";
  priority: "low" | "normal" | "high";
  reply: string | null;
  reason: string;
  verdict: {
    intent: { choice: string; confidence: number; probabilities: Record<string, number> };
    frustration: { score: number; confidence: number };
    isUrgent: boolean;
    needsHuman: boolean;
    latencyMs: number;
  } | null;
}

export const AUTO_REPLY_STUB: VocStub = {
  ticketId: "f3a91c08-1111-2222-3333-444444444444",
  action: "AUTO_REPLY",
  priority: "high",
  reply: "중복 결제 확인을 도와드리겠습니다. 결제일 기준 3영업일 내 자동 취소됩니다.",
  reason: "규칙 6: 임계값 통과(0.91 ≥ 0.7) → 자동응답",
  verdict: {
    intent: {
      choice: "billing",
      confidence: 0.91,
      probabilities: { billing: 0.91, technical: 0.06, account: 0.02, shipping: 0.01, etc: 0 },
    },
    frustration: { score: 1, confidence: 0.88 },
    isUrgent: true,
    needsHuman: false,
    latencyMs: 312,
  },
};

export const CLARIFY_STUB: VocStub = {
  ticketId: "a1b2c3d4-1111-2222-3333-444444444444",
  action: "CLARIFY",
  priority: "normal",
  reply: null,
  reason: "규칙 4: confidence 미달(0.41 < 0.7) → 되묻기",
  verdict: {
    intent: {
      choice: "billing",
      confidence: 0.41,
      probabilities: { billing: 0.41, technical: 0.3, account: 0.2, shipping: 0.09, etc: 0 },
    },
    frustration: { score: 0, confidence: 0.7 },
    isUrgent: false,
    needsHuman: false,
    latencyMs: 180,
  },
};

export const ESCALATE_STUB: VocStub = {
  ticketId: "99887766-1111-2222-3333-444444444444",
  action: "ESCALATE",
  priority: "high",
  reply: null,
  reason: "규칙 2: 불만도 최고 레벨(2) → 즉시 이관",
  verdict: {
    intent: {
      choice: "billing",
      confidence: 0.96,
      probabilities: { billing: 0.96, technical: 0.02, account: 0.01, shipping: 0.01, etc: 0 },
    },
    frustration: { score: 2, confidence: 0.97 },
    isUrgent: true,
    needsHuman: true,
    latencyMs: 240,
  },
};

/** /api/voc 응답을 고정한다. */
export async function stubVoc(page: Page, body: VocStub): Promise<void> {
  await page.route("**/api/voc", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

/** /api/voc 를 500 으로 떨어뜨린다. */
export async function stubVocFailure(page: Page): Promise<void> {
  await page.route("**/api/voc", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "BOOM" }),
    });
  });
}
