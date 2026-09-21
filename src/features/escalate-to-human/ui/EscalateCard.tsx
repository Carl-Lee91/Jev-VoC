import { CHAT_COPY } from "@/shared/config";
import { Button } from "@/shared/ui";

interface EscalateCardProps {
  ticketId: string;
  onEscalate?: () => void;
}

/** 이관 분기에서 답변 버블 대신 노출되는 카드 (docs/02-화면명세서.md S-01) */
export function EscalateCard({ ticketId, onEscalate }: EscalateCardProps) {
  return (
    <section
      aria-label="상담원 이관 안내"
      className="rounded-2xl border border-escalate-line bg-escalate-soft p-4"
    >
      <h3 className="text-sm font-semibold text-escalate-strong">
        {CHAT_COPY.escalateTitle}
      </h3>
      <p className="mt-1 text-sm text-content-muted">{CHAT_COPY.escalateHint}</p>
      <p className="mt-3 text-xs text-content-muted">
        접수번호{" "}
        <span className="font-mono font-medium text-content">
          {formatTicketNumber(ticketId)}
        </span>
      </p>
      <Button variant="escalate" className="mt-3" onClick={onEscalate}>
        상담원 연결
      </Button>
    </section>
  );
}

/** 접수번호는 앞 8자만 보여준다. (docs/02-화면명세서.md S-03) */
export function formatTicketNumber(ticketId: string): string {
  return ticketId.slice(0, 8);
}
