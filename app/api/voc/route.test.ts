// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VOC_QUESTIONS, type VocAnswers } from "@/shared/api";
import { resetJevClient } from "@/shared/api/jev.server";
import { JEV_TIMEOUT_MS, MESSAGE_MAX_LENGTH } from "@/shared/config";

const { systemOneMock, clientConstructionError } = vi.hoisted(() => ({
  systemOneMock: vi.fn(),
  clientConstructionError: { current: null as Error | null },
}));

// Jev 실 API 는 테스트에서 절대 호출하지 않는다. (docs/03-테스트케이스.md 1.2)
vi.mock("@typesafe-ai/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@typesafe-ai/sdk")>();
  return {
    ...actual,
    TypeSafeClient: class {
      systemOne = systemOneMock;

      constructor() {
        if (clientConstructionError.current !== null) {
          throw clientConstructionError.current;
        }
      }
    },
  };
});

const { POST } = await import("./route");

const FAKE_API_KEY = "sk-test-do-not-leak-1234567890";

/** legend 는 질문 스키마의 criteria 그대로 내려오므로 상수에서 만든다. */
const FRUSTRATION_LEGEND = {
  0: VOC_QUESTIONS.frustration.criteria[0],
  1: VOC_QUESTIONS.frustration.criteria[1],
  2: VOC_QUESTIONS.frustration.criteria[2],
};

function makeAnswers(overrides: Partial<VocAnswers> = {}): VocAnswers {
  return {
    intent: {
      type: "choice",
      choice: "billing",
      confidence: 0.91,
      probabilities: {
        billing: 0.91,
        technical: 0.06,
        account: 0.02,
        shipping: 0.01,
        etc: 0,
      },
    },
    frustration: {
      type: "score",
      score: 1,
      confidence: 0.88,
      legend: FRUSTRATION_LEGEND,
      probabilities: { 0: 0.1, 1: 0.8, 2: 0.1 },
    },
    is_urgent: { type: "noul", noul: 0.95 },
    needs_human: { type: "noul", noul: 0.05 },
    ...overrides,
  };
}

function mockJevAnswers(answers: VocAnswers = makeAnswers()): void {
  systemOneMock.mockResolvedValue({
    model: "jev-latest",
    answers,
    usage: { input_tokens: 12, output_tokens: 4 },
  });
}

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/voc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv("TYPESAFE_API_KEY", FAKE_API_KEY);
  systemOneMock.mockReset();
  clientConstructionError.current = null;
  resetJevClient();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("POST /api/voc 정상 처리", () => {
  it("TC-I-01: 정상 요청이면 200 과 함께 action/priority/verdict/reason 을 모두 반환한다", async () => {
    mockJevAnswers();

    const response = await POST(makeRequest({ message: "결제가 두 번 됐어요" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ticketId).toEqual(expect.any(String));
    expect(body.action).toBe("AUTO_REPLY");
    expect(body.priority).toBe("high");
    expect(body.reason).toContain("규칙 6");
    expect(body.verdict.intent.choice).toBe("billing");
    expect(body.verdict.isUrgent).toBe(true);
    expect(body.verdict.needsHuman).toBe(false);
    expect(body.reply).toEqual(expect.any(String));
  });

  it("TC-I-07: latencyMs 가 0 이상의 숫자로 응답에 포함된다", async () => {
    mockJevAnswers();

    const response = await POST(makeRequest({ message: "결제가 두 번 됐어요" }));
    const body = await response.json();

    expect(typeof body.verdict.latencyMs).toBe("number");
    expect(body.verdict.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("TC-I-08: 응답 어디에도 API 키가 섞여 나가지 않는다", async () => {
    mockJevAnswers();

    const response = await POST(makeRequest({ message: "결제가 두 번 됐어요" }));
    const raw = await response.text();

    expect(raw).not.toContain(FAKE_API_KEY);
    expect(raw).not.toContain("TYPESAFE_API_KEY");
  });

  it("TC-I-09: 4개 질문을 단 한 번의 호출로 보낸다", async () => {
    mockJevAnswers();

    await POST(makeRequest({ message: "결제가 두 번 됐어요" }));

    expect(systemOneMock).toHaveBeenCalledTimes(1);
    const [payload] = systemOneMock.mock.calls[0];
    expect(Object.keys(payload.questions)).toEqual([
      "intent",
      "frustration",
      "is_urgent",
      "needs_human",
    ]);
  });

  it("CLARIFY 로 분기하면 FAQ 템플릿 답변을 붙이지 않는다", async () => {
    mockJevAnswers(
      makeAnswers({
        intent: {
          type: "choice",
          choice: "billing",
          confidence: 0.41,
          probabilities: { billing: 0.41, technical: 0.3, account: 0.2, shipping: 0.09, etc: 0 },
        },
      }),
    );

    const response = await POST(makeRequest({ message: "그거 어떻게 하는 거였죠?" }));
    const body = await response.json();

    expect(body.action).toBe("CLARIFY");
    expect(body.reply).toBeNull();
  });

  it("불만도가 최고 레벨이면 우선순위 high 로 즉시 이관한다", async () => {
    mockJevAnswers(
      makeAnswers({
        frustration: {
          type: "score",
          score: 2,
          confidence: 0.97,
          legend: FRUSTRATION_LEGEND,
          probabilities: { 0: 0, 1: 0.03, 2: 0.97 },
        },
      }),
    );

    const response = await POST(makeRequest({ message: "당장 환불해주세요!!" }));
    const body = await response.json();

    expect(body.action).toBe("ESCALATE");
    expect(body.priority).toBe("high");
    expect(body.reply).toBeNull();
  });
});

describe("POST /api/voc 입력 검증", () => {
  it("TC-I-02: 빈 문자열이면 400 과 INVALID_INPUT 을 반환한다", async () => {
    const response = await POST(makeRequest({ message: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("INVALID_INPUT");
    expect(systemOneMock).not.toHaveBeenCalled();
  });

  it("TC-I-03: 2001자를 넘기면 400 을 반환한다", async () => {
    const response = await POST(
      makeRequest({ message: "가".repeat(MESSAGE_MAX_LENGTH + 1) }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toContain(`${MESSAGE_MAX_LENGTH}자 이내`);
    expect(systemOneMock).not.toHaveBeenCalled();
  });

  it("TC-I-04: 정확히 2000자면 정상 처리한다", async () => {
    mockJevAnswers();

    const response = await POST(makeRequest({ message: "가".repeat(MESSAGE_MAX_LENGTH) }));

    expect(response.status).toBe(200);
    expect(systemOneMock).toHaveBeenCalledTimes(1);
  });

  it("message 필드가 없거나 본문이 JSON 이 아니면 400 을 반환한다", async () => {
    const missingField = await POST(makeRequest({ text: "오타난 필드" }));
    expect(missingField.status).toBe(400);

    const notJson = new Request("http://localhost/api/voc", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "이건 JSON 이 아니다",
    });
    expect((await POST(notJson)).status).toBe(400);
  });
});

describe("POST /api/voc 장애 폴백", () => {
  it("TC-I-05: Jev 가 에러를 던져도 5xx 가 아니라 200 + ESCALATE 로 응답한다", async () => {
    systemOneMock.mockRejectedValue(new Error("Jev 폭발"));

    const response = await POST(makeRequest({ message: "결제가 두 번 됐어요" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.action).toBe("ESCALATE");
    expect(body.verdict).toBeNull();
    expect(body.reply).toBeNull();
    expect(body.reason).toContain("규칙 1");
  });

  it("TC-I-05: API 키가 없어 클라이언트 생성이 실패해도 ESCALATE 로 폴백한다", async () => {
    clientConstructionError.current = new Error("The API key is missing");

    const response = await POST(makeRequest({ message: "결제가 두 번 됐어요" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.action).toBe("ESCALATE");
    expect(body.verdict).toBeNull();
  });

  it("TC-I-06: 제한 시간을 넘기면 200 + ESCALATE 로 폴백한다", async () => {
    vi.useFakeTimers();
    systemOneMock.mockImplementation(() => new Promise(() => {}));

    const pending = POST(makeRequest({ message: "응답이 영영 안 오는 문의" }));
    await vi.advanceTimersByTimeAsync(JEV_TIMEOUT_MS);

    const response = await pending;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.action).toBe("ESCALATE");
    expect(body.verdict).toBeNull();
    expect(body.reason).toContain("규칙 1");
  });
});
