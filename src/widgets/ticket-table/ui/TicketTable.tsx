"use client";

import Link from "next/link";
import { useState } from "react";

import { filterTickets, sortTickets, type Ticket, type TicketFilter } from "@/entities/ticket";
import { ACTION_LABELS } from "@/shared/config";
import { ROUTE_ACTIONS } from "@/shared/model";

import { TicketRow } from "./TicketRow";

const FILTERS: { value: TicketFilter; label: string }[] = [
  { value: "ALL", label: "전체" },
  ...ROUTE_ACTIONS.map((action) => ({ value: action, label: ACTION_LABELS[action] })),
];

const COLUMNS = [
  "접수번호",
  "문의 내용",
  "의도",
  "confidence",
  "불만도",
  "우선순위",
  "처리",
  "접수시각",
];

interface TicketTableProps {
  tickets: Ticket[];
}

/** 티켓 목록 (docs/02-화면명세서.md S-03) */
export function TicketTable({ tickets }: TicketTableProps) {
  const [filter, setFilter] = useState<TicketFilter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = sortTickets(filterTickets(tickets, filter));

  const toggle = (ticketId: string) => {
    setExpandedId((current) => (current === ticketId ? null : ticketId));
  };

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <p className="text-sm text-content-muted">아직 접수된 문의가 없습니다</p>
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-medium text-content underline underline-offset-4"
        >
          상담 시작하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="처리 유형 필터" className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              filter === option.value
                ? "border-content bg-content text-content-inverse"
                : "border-line bg-surface text-content-muted hover:text-content"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        role="table"
        aria-label="접수된 문의"
        className="overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div role="rowgroup" className="hidden md:block">
          <div
            role="row"
            className="grid grid-cols-[7rem_1fr_5rem_6rem_4rem_5rem_6rem_6rem] gap-2 border-b border-line bg-surface-muted px-4 py-2 pl-5 text-xs font-medium text-content-muted"
          >
            {COLUMNS.map((column) => (
              <span key={column} role="columnheader">
                {column}
              </span>
            ))}
          </div>
        </div>

        <div role="rowgroup" data-testid="ticket-rows">
          {visible.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              isExpanded={expandedId === ticket.id}
              onToggle={toggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
