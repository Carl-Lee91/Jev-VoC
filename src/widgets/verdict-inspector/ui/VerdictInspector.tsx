"use client";

import { useState } from "react";

import type { JevVerdict } from "@/entities/verdict";
import { INTENT_LABELS } from "@/shared/config";
import { isIntent } from "@/shared/model";

import { InspectorBody } from "./InspectorBody";

export type InspectorState = "idle" | "loading" | "done";

interface VerdictInspectorProps {
  state: InspectorState;
  verdict: JevVerdict | null;
  reason: string | null;
}

const IDLE_TEXT = "문의를 입력하면 Jev 판정 결과가 여기에 표시됩니다";
const FAILED_TEXT = "판정 실패 — 안전 폴백으로 이관 처리됨";

/**
 * 판정 인스펙터 패널 (docs/02-화면명세서.md S-02)
 *
 * lg 이상에서는 우측 고정 패널, 그 미만에서는 기본 접힘 아코디언으로 보인다.
 * 본문은 한 번만 렌더하고 CSS 로만 접고 편다.
 */
export function VerdictInspector({ state, verdict, reason }: VerdictInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label="판정 인스펙터"
      className="rounded-2xl border border-line bg-surface lg:w-[340px] lg:shrink-0"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left lg:hidden"
      >
        <span className="text-sm font-semibold text-content">판정 인스펙터</span>
        <span className="text-xs text-content-muted">{buildSummary(verdict)}</span>
      </button>

      <h2 className="hidden px-4 py-3 text-sm font-semibold text-content lg:block">
        판정 인스펙터
      </h2>

      <div
        data-testid="inspector-content"
        className={`px-4 pb-4 ${isOpen ? "block" : "hidden lg:block"}`}
      >
        <InspectorContent state={state} verdict={verdict} reason={reason} />
      </div>
    </aside>
  );
}

function InspectorContent({ state, verdict, reason }: VerdictInspectorProps) {
  if (state === "idle") {
    return <p className="text-xs leading-relaxed text-content-muted">{IDLE_TEXT}</p>;
  }

  if (state === "loading") {
    return <InspectorSkeleton />;
  }

  if (verdict === null) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg bg-escalate-soft p-3 text-xs font-medium text-escalate-strong">
          {FAILED_TEXT}
        </p>
        {reason !== null ? (
          <section className="rounded-lg bg-surface-sunken p-3">
            <h3 className="text-xs font-semibold text-content">적용된 라우팅 규칙</h3>
            <p className="mt-1 text-xs leading-relaxed text-content-muted">{reason}</p>
          </section>
        ) : null}
      </div>
    );
  }

  return <InspectorBody verdict={verdict} reason={reason} />;
}

function InspectorSkeleton() {
  return (
    <div role="status" aria-label="판정 중" className="flex flex-col gap-2">
      {[0, 1, 2, 3].map((row) => (
        <span
          key={row}
          className="h-4 animate-pulse rounded bg-surface-sunken"
          style={{ width: `${100 - row * 12}%` }}
        />
      ))}
    </div>
  );
}

/** 모바일 아코디언 헤더의 요약 문구 (예: "결제 · 0.91") */
function buildSummary(verdict: JevVerdict | null): string {
  if (verdict === null) {
    return "판정 없음";
  }
  const choice = verdict.intent.choice;
  const label = isIntent(choice) ? INTENT_LABELS[choice] : choice;
  return `${label} · ${verdict.intent.confidence.toFixed(2)}`;
}
