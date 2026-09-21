import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Message } from "@/entities/message";
import type { VocResponse } from "@/shared/api";
import { CHAT_COPY, EXAMPLE_INQUIRIES } from "@/shared/config";
import type { JevVerdict, RouteAction } from "@/shared/model";

import { ChatPanel } from "./ChatPanel";

const TICKET_ID = "f3a91c08-1111-2222-3333-444444444444";

function makeVerdict(isUrgent: boolean): JevVerdict {
  return {
    intent: {
      choice: "billing",
      confidence: 0.91,
      probabilities: { billing: 0.91, technical: 0.09 },
    },
    frustration: { score: 1, confidence: 0.88 },
    isUrgent,
    needsHuman: false,
    latencyMs: 312,
  };
}

function makeBotMessage(
  action: RouteAction,
  options: { isUrgent?: boolean; verdict?: JevVerdict | null } = {},
): Message {
  const outcome: VocResponse = {
    ticketId: TICKET_ID,
    action,
    priority: "normal",
    reply: action === "AUTO_REPLY" ? "중복 결제 확인을 도와드리겠습니다." : null,
    reason: "규칙 6: 임계값 통과 → 자동응답",
    verdict:
      options.verdict === undefined
        ? makeVerdict(options.isUrgent ?? false)
        : options.verdict,
  };

  return {
    id: "bot-1",
    role: "bot",
    text: outcome.reply ?? "",
    createdAt: "2026-09-21T09:00:00.000Z",
    outcome,
  };
}

function renderPanel(messages: Message[], isSending = false) {
  const onSend = vi.fn();
  const onReset = vi.fn();
  render(
    <ChatPanel
      messages={messages}
      isSending={isSending}
      onSend={onSend}
      onReset={onReset}
    />,
  );
  return { onSend, onReset };
}

describe("채팅 패널 액션별 렌더", () => {
  it("TC-C-08: AUTO_REPLY 면 답변 버블만 그리고 이관 카드는 없다", () => {
    renderPanel([makeBotMessage("AUTO_REPLY")]);

    expect(screen.getByText("중복 결제 확인을 도와드리겠습니다.")).toBeInTheDocument();
    expect(screen.queryByLabelText("상담원 이관 안내")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("되묻기 안내")).not.toBeInTheDocument();
  });

  it("TC-C-09: CLARIFY 면 되묻기 카드와 상담원 연결 버튼을 그린다", () => {
    renderPanel([makeBotMessage("CLARIFY")]);

    expect(screen.getByLabelText("되묻기 안내")).toBeInTheDocument();
    expect(screen.getByText(CHAT_COPY.clarifyPrompt)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "상담원 연결" })).toBeInTheDocument();
  });

  it("TC-C-10: ESCALATE 면 이관 카드와 접수번호를 그린다", () => {
    renderPanel([makeBotMessage("ESCALATE")]);

    expect(screen.getByLabelText("상담원 이관 안내")).toBeInTheDocument();
    expect(screen.getByText(TICKET_ID.slice(0, 8))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "상담원 연결" })).toBeInTheDocument();
  });

  it("TC-C-11: 긴급 판정이면 긴급 배지를 그린다", () => {
    renderPanel([makeBotMessage("AUTO_REPLY", { isUrgent: true })]);

    expect(screen.getByText(CHAT_COPY.urgentBadge, { exact: false })).toBeInTheDocument();
  });

  it("TC-C-12: 긴급이 아니면 긴급 배지를 그리지 않는다", () => {
    renderPanel([makeBotMessage("AUTO_REPLY", { isUrgent: false })]);

    expect(
      screen.queryByText(CHAT_COPY.urgentBadge, { exact: false }),
    ).not.toBeInTheDocument();
  });

  it("판정이 없는 자동응답이어도 긴급 배지 없이 크래시하지 않는다", () => {
    renderPanel([makeBotMessage("AUTO_REPLY", { verdict: null })]);

    expect(
      screen.queryByText(CHAT_COPY.urgentBadge, { exact: false }),
    ).not.toBeInTheDocument();
  });
});

describe("채팅 패널 상태별 렌더", () => {
  it("TC-C-13: 최초 진입이면 인사말과 예시 칩 3개를 보여준다", () => {
    renderPanel([]);

    expect(screen.getByText(CHAT_COPY.greeting)).toBeInTheDocument();
    for (const example of EXAMPLE_INQUIRIES) {
      expect(screen.getByRole("button", { name: example })).toBeInTheDocument();
    }
    expect(EXAMPLE_INQUIRIES).toHaveLength(3);
  });

  it("예시 칩을 누르면 그 문구로 전송을 요청한다", async () => {
    const { onSend } = renderPanel([]);

    screen.getByRole("button", { name: EXAMPLE_INQUIRIES[0] }).click();

    expect(onSend).toHaveBeenCalledWith(EXAMPLE_INQUIRIES[0]);
  });

  it("TC-C-14: 전송 중이면 타이핑 인디케이터를 보여준다", () => {
    renderPanel([], true);

    expect(screen.getByLabelText(CHAT_COPY.typing)).toBeInTheDocument();
  });

  it("TC-C-15: 메시지 컨테이너에 aria-live=polite 가 있다", () => {
    renderPanel([]);

    expect(screen.getByLabelText("상담 메시지")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("대화 초기화 버튼을 누르면 초기화 핸들러가 불린다", () => {
    const { onReset } = renderPanel([makeBotMessage("AUTO_REPLY")]);

    screen.getByRole("button", { name: "대화 초기화" }).click();

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
