import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Ticket } from "@/entities/ticket";
import type { JevVerdict, Priority, RouteAction } from "@/shared/model";

import { TicketTable } from "./TicketTable";

function makeVerdict(): JevVerdict {
  return {
    intent: {
      choice: "billing",
      confidence: 0.91,
      probabilities: { billing: 0.91, technical: 0.09 },
    },
    frustration: { score: 1, confidence: 0.88 },
    isUrgent: false,
    needsHuman: false,
    latencyMs: 312,
  };
}

function makeTicket(
  id: string,
  action: RouteAction,
  priority: Priority = "normal",
): Ticket {
  return {
    id: `${id}-0000-0000-0000-000000000000`,
    message: `문의 ${id}`,
    verdict: makeVerdict(),
    action,
    priority,
    reply: action === "AUTO_REPLY" ? "답변 템플릿" : null,
    createdAt: "2026-09-21T09:00:00.000Z",
  };
}

const TICKETS: Ticket[] = [
  makeTicket("auto1111", "AUTO_REPLY"),
  makeTicket("clarify1", "CLARIFY"),
  makeTicket("escala11", "ESCALATE", "high"),
];

function getRows() {
  return within(screen.getByTestId("ticket-rows")).getAllByRole("row");
}

describe("티켓 목록", () => {
  it("TC-C-23: 티켓이 없으면 안내 문구와 상담 시작 링크를 보여준다", () => {
    render(<TicketTable tickets={[]} />);

    expect(screen.getByText("아직 접수된 문의가 없습니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "상담 시작하기" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("TC-C-24: 데이터 수만큼 행을 그린다", () => {
    render(<TicketTable tickets={TICKETS} />);

    expect(getRows()).toHaveLength(TICKETS.length);
  });

  it("TC-C-25: 처리 유형 필터를 고르면 해당 유형만 남는다", async () => {
    const user = userEvent.setup();
    render(<TicketTable tickets={TICKETS} />);

    await user.click(screen.getByRole("button", { name: "되묻기" }));

    const rows = getRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("문의 clarify1");
  });

  it("TC-C-26: 우선순위 high 행을 강조한다", () => {
    render(<TicketTable tickets={TICKETS} />);

    const highRow = getRows().find(
      (row) => row.getAttribute("data-priority") === "high",
    );

    expect(highRow).toBeDefined();
    expect(within(highRow as HTMLElement).getByText("높음")).toHaveClass(
      "font-semibold",
    );
  });

  it("우선순위 high 를 먼저 그린다", () => {
    render(<TicketTable tickets={TICKETS} />);

    expect(getRows()[0]).toHaveTextContent("문의 escala11");
  });

  it("행을 클릭하면 판정 상세가 펼쳐진다", async () => {
    const user = userEvent.setup();
    render(<TicketTable tickets={TICKETS} />);

    const row = getRows()[0];
    expect(row).toHaveAttribute("aria-expanded", "false");

    await user.click(row);

    expect(getRows()[0]).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("meter").length).toBeGreaterThan(0);
  });
});
