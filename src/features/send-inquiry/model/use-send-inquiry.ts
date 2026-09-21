"use client";

import { useCallback, useState } from "react";

import { useMessageStore, type Message } from "@/entities/message";
import { useTicketStore } from "@/entities/ticket";
import { resolveAction } from "@/entities/verdict";
import { requestVocVerdict, type VocResponse } from "@/shared/api";
import { CHAT_COPY } from "@/shared/config";

interface SendInquiryResult {
  send: (message: string) => Promise<void>;
  isSending: boolean;
  /** 인스펙터가 보여줄 마지막 판정 */
  lastOutcome: VocResponse | null;
  /** 한 번도 보내지 않았으면 false */
  hasSent: boolean;
}

/**
 * 문의 전송 오케스트레이션.
 *
 * 판정·라우팅 결정은 전부 서버와 entities 의 순수 함수가 하고,
 * 여기서는 호출 순서와 화면 상태만 관리한다.
 */
export function useSendInquiry(): SendInquiryResult {
  const addMessage = useMessageStore((state) => state.addMessage);
  const addTicket = useTicketStore((state) => state.addTicket);
  const [isSending, setIsSending] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<VocResponse | null>(null);
  const [hasSent, setHasSent] = useState(false);

  const send = useCallback(
    async (message: string) => {
      setIsSending(true);
      setHasSent(true);
      addMessage(createMessage("customer", message, null));

      let outcome: VocResponse;
      try {
        outcome = await requestVocVerdict(message);
      } catch {
        // 서버가 죽어도 앱은 동작해야 한다. 규칙 1과 같은 안전 폴백을 적용한다.
        outcome = buildFallbackOutcome();
        addMessage(createMessage("system", CHAT_COPY.apiError, null));
      }

      addMessage(createMessage("bot", outcome.reply ?? "", outcome));
      addTicket({
        id: outcome.ticketId,
        message,
        verdict: outcome.verdict,
        action: outcome.action,
        priority: outcome.priority,
        reply: outcome.reply,
        createdAt: new Date().toISOString(),
      });
      setLastOutcome(outcome);
      setIsSending(false);
    },
    [addMessage, addTicket],
  );

  return { send, isSending, lastOutcome, hasSent };
}

function createMessage(
  role: Message["role"],
  text: string,
  outcome: VocResponse | null,
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    createdAt: new Date().toISOString(),
    outcome,
  };
}

function buildFallbackOutcome(): VocResponse {
  const decision = resolveAction(null);
  return {
    ticketId: crypto.randomUUID(),
    action: decision.action,
    priority: decision.priority,
    reply: null,
    reason: decision.reason,
    verdict: null,
  };
}
