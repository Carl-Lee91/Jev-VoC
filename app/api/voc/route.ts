import { buildVerdict, resolveAction } from "@/entities/verdict";
import { classifyInquiry } from "@/shared/api/jev.server";
import type { VocErrorResponse, VocResponse } from "@/shared/api";
import { getFaqReply } from "@/shared/config";
import { validateInquiry } from "@/shared/lib";
import type { JevVerdict } from "@/shared/model";

// Edge 지원 여부가 확인되지 않아 Node 런타임을 명시한다. (docs/01-기획명세서.md 5.5)
export const runtime = "nodejs";

/**
 * POST /api/voc — 문의 1건을 Jev 로 판정하고 라우팅 결과를 돌려준다.
 *
 * Jev 장애는 5xx 로 내보내지 않는다. 사용자 경험상 이관 분기로 정상 응답한다.
 * (docs/02-화면명세서.md 4)
 */
export async function POST(request: Request): Promise<Response> {
  const validation = validateInquiry(await readMessage(request));

  if (!validation.ok) {
    const error: VocErrorResponse = {
      error: "INVALID_INPUT",
      message: validation.message,
    };
    return Response.json(error, { status: 400 });
  }

  const verdict = await classifySafely(validation.message);
  const decision = resolveAction(verdict);

  const body: VocResponse = {
    ticketId: crypto.randomUUID(),
    action: decision.action,
    priority: decision.priority,
    reply: resolveReply(decision.action, verdict),
    reason: decision.reason,
    verdict,
  };

  return Response.json(body, { status: 200 });
}

/** 본문이 JSON 이 아니거나 message 가 없으면 undefined 를 돌려 검증에 맡긴다. */
async function readMessage(request: Request): Promise<unknown> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return undefined;
    }
    return (body as Record<string, unknown>).message;
  } catch {
    return undefined;
  }
}

/** Jev 호출 실패·타임아웃을 null 판정으로 흡수한다. (규칙 1 폴백) */
async function classifySafely(message: string): Promise<JevVerdict | null> {
  try {
    const { answers, latencyMs } = await classifyInquiry(message);
    return buildVerdict(answers, latencyMs);
  } catch {
    return null;
  }
}

/** 고객에게 나가는 문장은 Jev 가 아니라 FAQ 템플릿이 만든다. */
function resolveReply(action: VocResponse["action"], verdict: JevVerdict | null): string | null {
  if (action !== "AUTO_REPLY" || verdict === null) {
    return null;
  }
  return getFaqReply(verdict.intent.choice);
}
