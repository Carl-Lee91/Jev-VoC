import type { JevVerdict, Priority, RouteAction } from "../model";

/** POST /api/voc 요청 본문 */
export interface VocRequest {
  message: string;
}

/** POST /api/voc 성공 응답 (docs/02-화면명세서.md 4) */
export interface VocResponse {
  ticketId: string;
  action: RouteAction;
  priority: Priority;
  /** AUTO_REPLY 일 때만 FAQ 템플릿 문장이 담긴다 */
  reply: string | null;
  /** 적용된 라우팅 규칙 설명 */
  reason: string;
  /** Jev 호출에 실패하면 null */
  verdict: JevVerdict | null;
}

/** POST /api/voc 입력 검증 실패 응답 */
export interface VocErrorResponse {
  error: "INVALID_INPUT";
  message: string;
}
