import { MessageBubble } from "@/entities/message";
import { EscalateCard } from "@/features/escalate-to-human";
import type { VocResponse } from "@/shared/api";
import { CHAT_COPY } from "@/shared/config";
import { Badge } from "@/shared/ui";

import { ClarifyCard } from "./ClarifyCard";

interface BotOutcomeProps {
  outcome: VocResponse;
  onSelectIntent: (message: string) => void;
  onEscalate?: () => void;
  disabled?: boolean;
}

/**
 * 봇 응답을 라우팅 결과에 따라 그린다.
 * 어떤 분기인지 판단하지 않고, 서버가 내려준 action 을 그대로 렌더만 한다.
 */
export function BotOutcome({
  outcome,
  onSelectIntent,
  onEscalate,
  disabled,
}: BotOutcomeProps) {
  if (outcome.action === "ESCALATE") {
    return <EscalateCard ticketId={outcome.ticketId} onEscalate={onEscalate} />;
  }

  if (outcome.action === "CLARIFY") {
    return (
      <ClarifyCard
        onSelectIntent={onSelectIntent}
        onEscalate={onEscalate}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <MessageBubble role="bot">{outcome.reply}</MessageBubble>
      {outcome.verdict?.isUrgent ? (
        <Badge tone="urgent">🔥 {CHAT_COPY.urgentBadge}</Badge>
      ) : null}
    </div>
  );
}
