import { create } from "zustand";

import type { Ticket } from "./types";

/**
 * 처리된 문의를 누적하는 인메모리 스토어.
 * Phase 1 범위에서는 DB 영속화를 하지 않는다. (docs/01-기획명세서.md 2.2)
 */
interface TicketStoreState {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  clearTickets: () => void;
}

export const useTicketStore = create<TicketStoreState>((set) => ({
  tickets: [],
  addTicket: (ticket) => set((state) => ({ tickets: [...state.tickets, ticket] })),
  clearTickets: () => set({ tickets: [] }),
}));
