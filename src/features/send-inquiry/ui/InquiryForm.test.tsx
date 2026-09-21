import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { INQUIRY_VALIDATION_MESSAGES, MESSAGE_MAX_LENGTH } from "@/shared/config";

import { InquiryForm } from "./InquiryForm";

function renderForm(isSending = false) {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<InquiryForm onSubmit={onSubmit} isSending={isSending} />);

  return {
    onSubmit,
    user,
    textarea: screen.getByLabelText("문의 내용"),
    submitButton: screen.getByRole("button", { name: "문의 전송" }),
  };
}

describe("문의 입력 폼", () => {
  it("TC-C-01: 빈 값으로 전송하면 필수 입력 안내가 뜨고 제출되지 않는다", async () => {
    const { user, submitButton, onSubmit } = renderForm();

    await user.click(submitButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      INQUIRY_VALIDATION_MESSAGES.required,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("TC-C-02: 1자만 입력하면 최소 길이 안내가 뜬다", async () => {
    const { user, textarea, submitButton, onSubmit } = renderForm();

    await user.type(textarea, "가");
    await user.click(submitButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      INQUIRY_VALIDATION_MESSAGES.tooShort,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("TC-C-03: 2000자를 넘기면 최대 길이 안내가 뜬다", async () => {
    const { user, textarea, submitButton, onSubmit } = renderForm();

    await user.click(textarea);
    await user.paste("가".repeat(MESSAGE_MAX_LENGTH + 1));
    await user.click(submitButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      INQUIRY_VALIDATION_MESSAGES.tooLong,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("TC-C-04: 정상 입력을 제출하면 입력값과 함께 핸들러가 한 번 호출된다", async () => {
    const { user, textarea, submitButton, onSubmit } = renderForm();

    await user.type(textarea, "결제가 두 번 됐어요");
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("결제가 두 번 됐어요");
  });

  it("제출에 성공하면 입력창을 비운다", async () => {
    const { user, textarea, submitButton } = renderForm();

    await user.type(textarea, "결제가 두 번 됐어요");
    await user.click(submitButton);

    expect(textarea).toHaveValue("");
  });

  it("TC-C-05: 전송 중에는 입력창과 버튼이 비활성화된다", () => {
    const { textarea, submitButton } = renderForm(true);

    expect(textarea).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("TC-C-06: Enter 키로 제출된다", async () => {
    const { user, textarea, onSubmit } = renderForm();

    await user.type(textarea, "결제가 두 번 됐어요{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("결제가 두 번 됐어요");
  });

  it("TC-C-07: Shift+Enter 는 제출하지 않고 줄바꿈만 한다", async () => {
    const { user, textarea, onSubmit } = renderForm();

    await user.type(textarea, "첫 줄{Shift>}{Enter}{/Shift}둘째 줄");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("첫 줄\n둘째 줄");
  });
});
