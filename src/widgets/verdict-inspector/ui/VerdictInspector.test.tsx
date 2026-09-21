import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CONFIDENCE_THRESHOLD } from "@/shared/config";
import type { JevVerdict } from "@/shared/model";

import { VerdictInspector } from "./VerdictInspector";

function makeVerdict(overrides: Partial<JevVerdict["intent"]> = {}): JevVerdict {
  return {
    intent: {
      choice: "billing",
      confidence: 0.91,
      probabilities: {
        billing: 0.91,
        technical: 0.06,
        account: 0.02,
        shipping: 0.01,
        etc: 0,
      },
      ...overrides,
    },
    frustration: { score: 1, confidence: 0.88 },
    isUrgent: true,
    needsHuman: false,
    latencyMs: 312,
  };
}

const REASON = "규칙 6: 임계값 통과 → 자동응답";

describe("판정 인스펙터 상태별 렌더", () => {
  it("TC-C-16: 판정 전에는 안내 문구를 보여준다", () => {
    render(<VerdictInspector state="idle" verdict={null} reason={null} />);

    expect(
      screen.getByText("문의를 입력하면 Jev 판정 결과가 여기에 표시됩니다"),
    ).toBeInTheDocument();
  });

  it("로딩 중에는 스켈레톤을 보여준다", () => {
    render(<VerdictInspector state="loading" verdict={null} reason={null} />);

    expect(screen.getByLabelText("판정 중")).toBeInTheDocument();
  });

  it("TC-C-21: 판정이 없으면 안전 폴백 문구를 보여주고 크래시하지 않는다", () => {
    render(
      <VerdictInspector
        state="done"
        verdict={null}
        reason="규칙 1: Jev 호출 실패 → 안전 폴백으로 이관"
      />,
    );

    expect(screen.getByText("판정 실패 — 안전 폴백으로 이관 처리됨")).toBeInTheDocument();
    expect(screen.getByText(/규칙 1/)).toBeInTheDocument();
  });
});

describe("판정 인스펙터 본문", () => {
  it("TC-C-17: probabilities 항목 수만큼 확률 바를 내림차순으로 그린다", () => {
    render(<VerdictInspector state="done" verdict={makeVerdict()} reason={REASON} />);

    const meters = screen.getAllByRole("meter");
    expect(meters).toHaveLength(5);

    const values = meters.map((meter) => Number(meter.getAttribute("aria-valuenow")));
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(meters[0]).toHaveAccessibleName("billing 확률");
  });

  it("TC-C-18: 선택된 의도 항목을 강조한다", () => {
    render(<VerdictInspector state="done" verdict={makeVerdict()} reason={REASON} />);

    const selected = screen.getByRole("meter", { name: "billing 확률" }).closest("li");
    const other = screen.getByRole("meter", { name: "technical 확률" }).closest("li");

    expect(within(selected as HTMLElement).getByText("billing")).toHaveClass(
      "font-semibold",
    );
    expect(within(other as HTMLElement).getByText("technical")).not.toHaveClass(
      "font-semibold",
    );
  });

  it("TC-C-19: confidence 가 임계값 미달이면 경고 표시를 한다", () => {
    render(
      <VerdictInspector
        state="done"
        verdict={makeVerdict({ confidence: 0.41 })}
        reason="규칙 4: confidence 미달"
      />,
    );

    expect(screen.getByTestId("confidence-gauge")).toHaveAttribute(
      "data-passed",
      "false",
    );
    expect(
      screen.getByText(`임계값 ${CONFIDENCE_THRESHOLD} 미달`),
    ).toBeInTheDocument();
  });

  it("confidence 가 임계값을 넘으면 통과 표시를 한다", () => {
    render(<VerdictInspector state="done" verdict={makeVerdict()} reason={REASON} />);

    expect(screen.getByTestId("confidence-gauge")).toHaveAttribute(
      "data-passed",
      "true",
    );
  });

  it("TC-C-20: 적용된 라우팅 규칙 문구를 그대로 노출한다", () => {
    render(<VerdictInspector state="done" verdict={makeVerdict()} reason={REASON} />);

    expect(screen.getByText(REASON)).toBeInTheDocument();
  });

  it("TC-C-22: 응답 시간을 표시한다", () => {
    render(<VerdictInspector state="done" verdict={makeVerdict()} reason={REASON} />);

    expect(screen.getByText(/312ms/)).toBeInTheDocument();
  });

  it("긴급 / 이관필요 판정을 YES/NO 로 표시한다", () => {
    render(<VerdictInspector state="done" verdict={makeVerdict()} reason={REASON} />);

    expect(screen.getByText("긴급").parentElement).toHaveTextContent("YES");
    expect(screen.getByText("이관필요").parentElement).toHaveTextContent("NO");
  });

  it("모바일 아코디언 헤더에 의도와 confidence 요약을 보여준다", () => {
    render(<VerdictInspector state="done" verdict={makeVerdict()} reason={REASON} />);

    expect(screen.getByText("결제 · 0.91")).toBeInTheDocument();
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
  });
});
