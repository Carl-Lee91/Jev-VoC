import { beforeEach, describe, expect, it } from "vitest";

import { useTicketStore } from "./ticket-store";
import type { Ticket } from "./types";

function makeTicket(id: string): Ticket {
  return {
    id,
    message: `문의 ${id}`,
    verdict: null,
    action: "ESCALATE",
    priority: "normal",
    reply: null,
    createdAt: "2026-09-21T09:00:00.000Z",
  };
}

describe("티켓 스토어", () => {
  beforeEach(() => {
    useTicketStore.getState().clearTickets();
  });

  it("처음에는 티켓이 비어있다", () => {
    expect(useTicketStore.getState().tickets).toEqual([]);
  });

  it("티켓을 추가하면 접수 순서대로 누적된다", () => {
    useTicketStore.getState().addTicket(makeTicket("first"));
    useTicketStore.getState().addTicket(makeTicket("second"));

    expect(useTicketStore.getState().tickets.map((t) => t.id)).toEqual([
      "first",
      "second",
    ]);
  });

  it("초기화하면 누적된 티켓이 전부 비워진다", () => {
    useTicketStore.getState().addTicket(makeTicket("first"));
    useTicketStore.getState().clearTickets();

    expect(useTicketStore.getState().tickets).toEqual([]);
  });
});
