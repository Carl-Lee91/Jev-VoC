"use client";

import type { KeyboardEvent } from "react";

import type { Ticket } from "@/entities/ticket";
import { isConfidencePassing } from "@/entities/verdict";
import { formatTicketNumber } from "@/features/escalate-to-human";
import { ACTION_LABELS, PRIORITY_LABELS } from "@/shared/config";
import { formatClockTime } from "@/shared/lib";
import { Badge, IntentBadge } from "@/shared/ui";

import { TicketDetail } from "./TicketDetail";

const ACTION_TONE = {
  AUTO_REPLY: "auto",
  CLARIFY: "clarify",
  ESCALATE: "escalate",
} as const;

interface TicketRowProps {
  ticket: Ticket;
  isExpanded: boolean;
  onToggle: (ticketId: string) => void;
}

const CELL = "flex items-center gap-2 md:block";
const LABEL = "text-xs text-content-muted md:hidden";

export function TicketRow({ ticket, isExpanded, onToggle }: TicketRowProps) {
  const verdict = ticket.verdict;
  const isHigh = ticket.priority === "high";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    onToggle(ticket.id);
  };

  return (
    <div className={isHigh ? "border-l-4 border-escalate" : "border-l-4 border-transparent"}>
      <div
        role="row"
        tabIndex={0}
        aria-expanded={isExpanded}
        data-priority={ticket.priority}
        onClick={() => onToggle(ticket.id)}
        onKeyDown={handleKeyDown}
        className={`grid cursor-pointer grid-cols-1 gap-2 border-b border-line px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset--2 focus-visible:outline-content md:grid-cols-[7rem_1fr_5rem_6rem_4rem_5rem_6rem_6rem] md:items-center ${
          isHigh ? "bg-escalate-soft/40" : "hover:bg-surface-muted"
        }`}
      >
        <div role="cell" className={CELL}>
          <span className={LABEL}>접수번호</span>
          <span className="font-mono text-xs text-content-muted">
            {formatTicketNumber(ticket.id)}
          </span>
        </div>
        <div role="cell" className={CELL}>
          <span className={LABEL}>문의</span>
          <span className="line-clamp-1 text-content">{ticket.message}</span>
        </div>
        <div role="cell" className={CELL}>
          <span className={LABEL}>의도</span>
          {verdict ? <IntentBadge intent={verdict.intent.choice} /> : <span>-</span>}
        </div>
        <div role="cell" className={CELL}>
          <span className={LABEL}>confidence</span>
          {verdict ? (
            <span
              className={`tabular-nums ${
                isConfidencePassing(verdict.intent.confidence)
                  ? "text-content"
                  : "font-medium text-clarify-strong"
              }`}
            >
              {verdict.intent.confidence.toFixed(2)}
            </span>
          ) : (
            <span>-</span>
          )}
        </div>
        <div role="cell" className={CELL}>
          <span className={LABEL}>불만도</span>
          <span className="tabular-nums text-content">
            {verdict ? Math.round(verdict.frustration.score) : "-"}
          </span>
        </div>
        <div role="cell" className={CELL}>
          <span className={LABEL}>우선순위</span>
          <span className={isHigh ? "font-semibold text-escalate-strong" : "text-content-muted"}>
            {PRIORITY_LABELS[ticket.priority]}
          </span>
        </div>
        <div role="cell" className={CELL}>
          <span className={LABEL}>처리</span>
          <Badge tone={ACTION_TONE[ticket.action]}>{ACTION_LABELS[ticket.action]}</Badge>
        </div>
        <div role="cell" className={CELL}>
          <span className={LABEL}>접수시각</span>
          <span className="tabular-nums text-xs text-content-muted">
            {formatClockTime(ticket.createdAt)}
          </span>
        </div>
      </div>

      {isExpanded ? <TicketDetail ticket={ticket} /> : null}
    </div>
  );
}
