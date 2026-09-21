import type { VocResponse } from "@/shared/api";

export type MessageRole = "customer" | "bot" | "system";

/** 채팅 한 줄. 봇 메시지에는 판정 결과가 따라붙는다. */
export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  /** ISO 8601 */
  createdAt: string;
  /** 봇 메시지의 라우팅 결과. 고객·시스템 메시지는 null */
  outcome: VocResponse | null;
}
