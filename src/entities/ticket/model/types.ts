import type { JevVerdict, Priority, RouteAction } from "@/shared/model";

/** 처리된 문의 1건 (docs/01-기획명세서.md 6) */
export interface Ticket {
  id: string;
  message: string;
  /** Jev 호출에 실패하면 null */
  verdict: JevVerdict | null;
  action: RouteAction;
  priority: Priority;
  reply: string | null;
  /** ISO 8601 */
  createdAt: string;
}

/** 티켓 목록의 처리 유형 필터 값 */
export type TicketFilter = RouteAction | "ALL";
