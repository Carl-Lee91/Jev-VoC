import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { requestVocVerdict } from "./voc.client";
import type { VocResponse } from "./voc-contract";

const RESPONSE: VocResponse = {
  ticketId: "f3a91c08-0000-0000-0000-000000000000",
  action: "AUTO_REPLY",
  priority: "high",
  reply: "중복 결제 확인을 도와드리겠습니다.",
  reason: "규칙 6: 임계값 통과 → 자동응답",
  verdict: {
    intent: { choice: "billing", confidence: 0.91, probabilities: { billing: 0.91 } },
    frustration: { score: 1, confidence: 0.88 },
    isUrgent: true,
    needsHuman: false,
    latencyMs: 312,
  },
};

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("VOC 클라이언트", () => {
  it("입력한 문의를 본문에 실어 /api/voc 로 POST 한다", async () => {
    let receivedBody: unknown;
    server.use(
      http.post("/api/voc", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(RESPONSE);
      }),
    );

    const result = await requestVocVerdict("결제가 두 번 됐어요");

    expect(receivedBody).toEqual({ message: "결제가 두 번 됐어요" });
    expect(result).toEqual(RESPONSE);
  });

  it("서버가 500 을 내면 에러를 던져 호출자가 폴백하게 한다", async () => {
    server.use(
      http.post("/api/voc", () => HttpResponse.json({ error: "BOOM" }, { status: 500 })),
    );

    await expect(requestVocVerdict("결제가 두 번 됐어요")).rejects.toThrow();
  });
});
