"use client";

import Link from "next/link";

import { useTicketStore } from "@/entities/ticket";
import { TicketTable } from "@/widgets/ticket-table";

/** 티켓 목록 화면 (S-03) */
export function TicketsView() {
  const tickets = useTicketStore((state) => state.tickets);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-base font-semibold text-content">티켓 목록</h1>
        <Link
          href="/"
          className="text-xs text-content-muted underline underline-offset-4 hover:text-content"
        >
          상담 화면으로
        </Link>
      </header>

      <TicketTable tickets={tickets} />
    </main>
  );
}
