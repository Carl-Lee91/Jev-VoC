import type { Ticket } from "@/entities/ticket";
import { sortProbabilities } from "@/entities/verdict";
import { ProbabilityBar } from "@/shared/ui";

interface TicketDetailProps {
  ticket: Ticket;
}

/** 행을 펼쳤을 때 보이는 판정 상세 (docs/02-화면명세서.md S-03) */
export function TicketDetail({ ticket }: TicketDetailProps) {
  const verdict = ticket.verdict;

  return (
    <div className="border-b border-line bg-surface-muted px-4 py-4 text-sm">
      <p className="text-content">{ticket.message}</p>

      {verdict === null ? (
        <p className="mt-3 text-xs text-escalate-strong">
          판정 실패 — 안전 폴백으로 이관 처리됨
        </p>
      ) : (
        <div className="mt-3 max-w-md">
          <ul className="flex flex-col gap-1.5">
            {sortProbabilities(verdict.intent.probabilities).map((entry) => (
              <ProbabilityBar
                key={entry.label}
                label={entry.label}
                value={entry.value}
                highlighted={entry.label === verdict.intent.choice}
              />
            ))}
          </ul>
          <p className="mt-2 text-xs text-content-muted">⏱ {verdict.latencyMs}ms</p>
        </div>
      )}

      {ticket.reply !== null ? (
        <p className="mt-3 rounded-lg bg-surface p-3 text-xs leading-relaxed text-content-muted">
          {ticket.reply}
        </p>
      ) : null}
    </div>
  );
}
