import { describe, expect, it } from "vitest";

import type { RouteAction } from "@/shared/model";

import type { Ticket } from "../model/types";
import { filterTickets } from "./filter-tickets";

function makeTicket(id: string, action: RouteAction): Ticket {
  return {
    id,
    message: `문의 ${id}`,
    verdict: null,
    action,
    priority: "normal",
    reply: null,
    createdAt: "2026-09-21T09:00:00.000Z",
  };
}

const TICKETS: Ticket[] = [
  makeTicket("auto", "AUTO_REPLY"),
  makeTicket("clarify", "CLARIFY"),
  makeTicket("escalate", "ESCALATE"),
  makeTicket("auto2", "AUTO_REPLY"),
];

describe("티켓 필터 filterTickets", () => {
  it("TC-U-20: 선택한 처리 유형의 티켓만 반환한다", () => {
    expect(filterTickets(TICKETS, "AUTO_REPLY").map((t) => t.id)).toEqual([
      "auto",
      "auto2",
    ]);
    expect(filterTickets(TICKETS, "CLARIFY").map((t) => t.id)).toEqual(["clarify"]);
    expect(filterTickets(TICKETS, "ESCALATE").map((t) => t.id)).toEqual(["escalate"]);
  });

  it("ALL 이면 전부 반환한다", () => {
    expect(filterTickets(TICKETS, "ALL")).toHaveLength(TICKETS.length);
  });

  it("TC-U-21: 빈 배열을 걸러도 예외 없이 빈 배열을 반환한다", () => {
    expect(() => filterTickets([], "AUTO_REPLY")).not.toThrow();
    expect(filterTickets([], "AUTO_REPLY")).toEqual([]);
    expect(filterTickets([], "ALL")).toEqual([]);
  });
});
