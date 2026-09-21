import type { Ticket, TicketFilter } from "../model/types";

/** 처리 유형으로 티켓을 거른다. ALL 이면 전부 통과시킨다. */
export function filterTickets(
  tickets: readonly Ticket[],
  filter: TicketFilter,
): Ticket[] {
  if (filter === "ALL") {
    return [...tickets];
  }
  return tickets.filter((ticket) => ticket.action === filter);
}
