import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { useMessageStore } from "@/entities/message";
import { useTicketStore } from "@/entities/ticket";
import type { VocResponse } from "@/shared/api";
import { CHAT_COPY } from "@/shared/config";

import { useSendInquiry } from "./use-send-inquiry";

const SUCCESS: VocResponse = {
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

beforeEach(() => {
  useMessageStore.getState().resetMessages();
  useTicketStore.getState().clearTickets();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("문의 전송 오케스트레이션", () => {
  it("전송하면 고객 메시지와 봇 응답을 쌓고 티켓을 적재한다", async () => {
    server.use(http.post("/api/voc", () => HttpResponse.json(SUCCESS)));
    const { result } = renderHook(() => useSendInquiry());

    await act(async () => {
      await result.current.send("결제가 두 번 됐어요");
    });

    const messages = useMessageStore.getState().messages;
    expect(messages.map((message) => message.role)).toEqual(["customer", "bot"]);
    expect(messages[0].text).toBe("결제가 두 번 됐어요");
    expect(messages[1].outcome).toEqual(SUCCESS);

    const tickets = useTicketStore.getState().tickets;
    expect(tickets).toHaveLength(1);
    expect(tickets[0]).toMatchObject({
      id: SUCCESS.ticketId,
      message: "결제가 두 번 됐어요",
      action: "AUTO_REPLY",
      priority: "high",
    });

    expect(result.current.lastOutcome).toEqual(SUCCESS);
    expect(result.current.hasSent).toBe(true);
    expect(result.current.isSending).toBe(false);
  });

  it("서버가 실패하면 안내 메시지와 함께 이관 폴백으로 처리한다", async () => {
    server.use(
      http.post("/api/voc", () => HttpResponse.json({ error: "BOOM" }, { status: 500 })),
    );
    const { result } = renderHook(() => useSendInquiry());

    await act(async () => {
      await result.current.send("결제가 두 번 됐어요");
    });

    const messages = useMessageStore.getState().messages;
    expect(messages.map((message) => message.role)).toEqual([
      "customer",
      "system",
      "bot",
    ]);
    expect(messages[1].text).toBe(CHAT_COPY.apiError);

    expect(result.current.lastOutcome?.action).toBe("ESCALATE");
    expect(result.current.lastOutcome?.verdict).toBeNull();
    expect(result.current.lastOutcome?.reason).toContain("규칙 1");
    expect(useTicketStore.getState().tickets[0].action).toBe("ESCALATE");
  });

  it("전송이 끝나기 전까지 isSending 이 유지된다", async () => {
    let release: (() => void) | undefined;
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.post("/api/voc", async () => {
        await blocked;
        return HttpResponse.json(SUCCESS);
      }),
    );

    const { result } = renderHook(() => useSendInquiry());

    let pending: Promise<void>;
    act(() => {
      pending = result.current.send("결제가 두 번 됐어요");
    });

    await waitFor(() => {
      expect(result.current.isSending).toBe(true);
    });

    await act(async () => {
      release?.();
      await pending;
    });

    expect(result.current.isSending).toBe(false);
  });
});
