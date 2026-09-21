"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import type { KeyboardEvent } from "react";
import { useForm } from "react-hook-form";

import { Button, Spinner } from "@/shared/ui";

import { inquirySchema, type InquiryFormValues } from "../model/schema";

interface InquiryFormProps {
  onSubmit: (message: string) => void;
  isSending?: boolean;
}

export function InquiryForm({ onSubmit, isSending = false }: InquiryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: yupResolver(inquirySchema),
    defaultValues: { message: "" },
  });

  const submit = handleSubmit((values) => {
    onSubmit(values.message);
    reset({ message: "" });
  });

  // Enter 전송 / Shift+Enter 줄바꿈 (docs/02-화면명세서.md S-01)
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    void submit();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <textarea
          {...register("message")}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          rows={2}
          aria-label="문의 내용"
          aria-invalid={errors.message ? true : undefined}
          placeholder="문의를 입력하세요..."
          className="min-h-12 flex-1 resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content disabled:bg-surface-sunken"
        />
        <Button type="submit" aria-label="문의 전송" disabled={isSending}>
          {isSending ? <Spinner label="전송 중" /> : "전송"}
        </Button>
      </div>
      {errors.message ? (
        <p role="alert" className="px-1 text-xs text-escalate">
          {errors.message.message}
        </p>
      ) : null}
    </form>
  );
}
