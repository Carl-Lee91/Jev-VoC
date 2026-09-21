import { describe, expect, it } from "vitest";

import type { Priority } from "@/shared/model";

import type { Ticket } from "../model/types";
import { sortTickets } from "./sort-tickets";

function makeTicket(id: string, priority: Priority, createdAt: string): Ticket {
  return {
    id,
    message: `문의 ${id}`,
    verdict: null,
    action: "ESCALATE",
    priority,
    reply: null,
    createdAt,
  };
}

describe("티켓 정렬 sortTickets", () => {
  it("TC-U-18: 우선순위 high 를 먼저, 그다음 최신순으로 정렬한다", () => {
    const tickets = [
      makeTicket("a", "normal", "2026-09-21T10:00:00.000Z"),
      makeTicket("b", "high", "2026-09-21T09:00:00.000Z"),
      makeTicket("c", "normal", "2026-09-21T11:00:00.000Z"),
      makeTicket("d", "high", "2026-09-21T12:00:00.000Z"),
    ];

    expect(sortTickets(tickets).map((ticket) => ticket.id)).toEqual([
      "d",
      "b",
      "c",
      "a",
    ]);
  });

  it("TC-U-19: 같은 우선순위끼리는 createdAt 내림차순으로 최신이 앞에 온다", () => {
    const tickets = [
      makeTicket("old", "normal", "2026-09-21T09:00:00.000Z"),
      makeTicket("new", "normal", "2026-09-21T09:00:01.000Z"),
    ];

    expect(sortTickets(tickets).map((ticket) => ticket.id)).toEqual(["new", "old"]);
  });

  it("low 우선순위는 normal 보다 뒤로 간다", () => {
    const tickets = [
      makeTicket("low", "low", "2026-09-21T12:00:00.000Z"),
      makeTicket("normal", "normal", "2026-09-21T09:00:00.000Z"),
    ];

    expect(sortTickets(tickets).map((ticket) => ticket.id)).toEqual([
      "normal",
      "low",
    ]);
  });

  it("원본 배열을 변형하지 않는다", () => {
    const tickets = [
      makeTicket("a", "normal", "2026-09-21T09:00:00.000Z"),
      makeTicket("b", "high", "2026-09-21T08:00:00.000Z"),
    ];

    sortTickets(tickets);

    expect(tickets.map((ticket) => ticket.id)).toEqual(["a", "b"]);
  });

  it("TC-U-21: 빈 배열을 정렬해도 예외 없이 빈 배열을 반환한다", () => {
    expect(() => sortTickets([])).not.toThrow();
    expect(sortTickets([])).toEqual([]);
  });
});
