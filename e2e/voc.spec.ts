import { expect, test } from "@playwright/test";

import {
  AUTO_REPLY_STUB,
  CLARIFY_STUB,
  ESCALATE_STUB,
  stubVoc,
  stubVocFailure,
} from "./fixtures";

const INQUIRY = "결제가 두 번 됐어요. 빨리 처리해주세요";

test("TC-E-01: 자동응답 플로우 — 답변과 판정, 티켓 적재까지 이어진다", async ({ page }) => {
  await stubVoc(page, AUTO_REPLY_STUB);
  await page.goto("/");

  await page.getByLabel("문의 내용").fill(INQUIRY);
  await page.getByRole("button", { name: "문의 전송" }).click();

  await expect(page.getByText(AUTO_REPLY_STUB.reply ?? "")).toBeVisible();
  await expect(page.getByText("우선 처리 요청됨")).toBeVisible();

  const inspector = page.getByLabel("판정 인스펙터");
  await expect(inspector.getByRole("meter", { name: "billing 확률" })).toHaveAttribute(
    "aria-valuenow",
    "91",
  );
  await expect(inspector.getByTestId("confidence-gauge")).toContainText("0.91");
  await expect(inspector.getByText("규칙 6", { exact: false })).toBeVisible();
  await expect(inspector.getByText("312ms")).toBeVisible();

  await page.getByRole("link", { name: "티켓 목록 보기" }).click();
  await expect(page.getByRole("heading", { name: "티켓 목록" })).toBeVisible();
  await expect(page.getByTestId("ticket-rows").getByRole("row")).toHaveCount(1);
  await expect(page.getByTestId("ticket-rows")).toContainText(INQUIRY);
});

test("TC-E-02: 되묻기 플로우 — 되묻기 카드와 상담원 버튼이 나온다", async ({ page }) => {
  await stubVoc(page, CLARIFY_STUB);
  await page.goto("/");

  await page.getByLabel("문의 내용").fill("그거 어떻게 하는 거였죠?");
  await page.getByRole("button", { name: "문의 전송" }).click();

  await expect(page.getByLabel("되묻기 안내")).toBeVisible();
  await expect(page.getByText("조금 더 자세히 알려주시겠어요?")).toBeVisible();
  await expect(page.getByRole("button", { name: "상담원 연결" })).toBeVisible();
  await expect(page.getByText("임계값 0.7 미달")).toBeVisible();
});

test("TC-E-03: 고불만은 즉시 이관되고 티켓 우선순위가 높음이 된다", async ({ page }) => {
  await stubVoc(page, ESCALATE_STUB);
  await page.goto("/");

  await page.getByLabel("문의 내용").fill("당장 환불해주세요!! 이게 말이 됩니까");
  await page.getByRole("button", { name: "문의 전송" }).click();

  await expect(page.getByLabel("상담원 이관 안내")).toBeVisible();
  await expect(page.getByText(ESCALATE_STUB.ticketId.slice(0, 8))).toBeVisible();

  await page.getByRole("link", { name: "티켓 목록 보기" }).click();
  const row = page.getByTestId("ticket-rows").getByRole("row").first();
  await expect(row).toHaveAttribute("data-priority", "high");
  await expect(row).toContainText("높음");
});

test("TC-E-04: Jev 장애에도 앱이 죽지 않고 이관으로 폴백한다", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await stubVocFailure(page);
  await page.goto("/");

  await page.getByLabel("문의 내용").fill(INQUIRY);
  await page.getByRole("button", { name: "문의 전송" }).click();

  await expect(
    page.getByText("일시적인 오류가 발생했어요. 상담원에게 연결해 드릴게요."),
  ).toBeVisible();
  await expect(page.getByLabel("상담원 이관 안내")).toBeVisible();
  await expect(page.getByText("판정 실패 — 안전 폴백으로 이관 처리됨")).toBeVisible();

  expect(pageErrors).toHaveLength(0);
  await expect(page.getByLabel("문의 내용")).toBeEnabled();
});

test("TC-E-05: 대화를 초기화하면 인사말 화면으로 돌아간다", async ({ page }) => {
  await stubVoc(page, AUTO_REPLY_STUB);
  await page.goto("/");

  await page.getByLabel("문의 내용").fill(INQUIRY);
  await page.getByRole("button", { name: "문의 전송" }).click();
  await expect(page.getByText(AUTO_REPLY_STUB.reply ?? "")).toBeVisible();

  await page.getByRole("button", { name: "대화 초기화" }).click();

  await expect(page.getByText(AUTO_REPLY_STUB.reply ?? "")).toHaveCount(0);
  await expect(
    page.getByText("안녕하세요. 무엇을 도와드릴까요?", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "결제가 두 번 됐어요. 빨리 처리해주세요" })).toBeVisible();
});

test.describe("모바일 360px", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("TC-E-06: 인스펙터가 기본 접힌 아코디언으로 바뀐다", async ({ page }) => {
    await stubVoc(page, AUTO_REPLY_STUB);
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /판정 인스펙터/ });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("inspector-content")).toBeHidden();

    await page.getByLabel("문의 내용").fill(INQUIRY);
    await page.getByRole("button", { name: "문의 전송" }).click();
    await expect(page.getByText(AUTO_REPLY_STUB.reply ?? "")).toBeVisible();

    await expect(toggle).toContainText("결제 · 0.91");
    await expect(page.getByTestId("inspector-content")).toBeHidden();

    await toggle.click();
    await expect(page.getByTestId("inspector-content")).toBeVisible();
  });
});

test("TC-E-07: 키보드만으로 문의를 전송할 수 있다", async ({ page }) => {
  await stubVoc(page, AUTO_REPLY_STUB);
  await page.goto("/");

  await page.keyboard.press("Tab");
  while (!(await page.getByLabel("문의 내용").evaluate((node) => node === document.activeElement))) {
    await page.keyboard.press("Tab");
  }

  await page.keyboard.type(INQUIRY);
  await page.keyboard.press("Enter");

  await expect(page.getByText(AUTO_REPLY_STUB.reply ?? "")).toBeVisible();
});
