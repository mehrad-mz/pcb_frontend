"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export const OTP_LENGTH = 5;

export type OtpInputStatus = "idle" | "error" | "success";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  status?: OtpInputStatus;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
};

function toDigits(value: string): string[] {
  const chars = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
  return Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? "");
}

export function OtpInput({
  value,
  onChange,
  status = "idle",
  disabled = false,
  id = "otp-code",
  "aria-invalid": ariaInvalid,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const digits = toDigits(value);

  function emit(nextDigits: string[]) {
    onChange(nextDigits.join(""));
  }

  function focusAt(index: number) {
    const clamped = Math.max(0, Math.min(index, OTP_LENGTH - 1));
    inputRefs.current[clamped]?.focus();
  }

  function applyDigits(nextChars: string[], focusIndex?: number) {
    emit(nextChars);
    if (focusIndex !== undefined) {
      requestAnimationFrame(() => focusAt(focusIndex));
    }
  }

  function handleChange(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    applyDigits(nextDigits, digit && index < OTP_LENGTH - 1 ? index + 1 : index);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const nextDigits = [...digits];

      if (nextDigits[index]) {
        nextDigits[index] = "";
        applyDigits(nextDigits, index);
        return;
      }

      if (index > 0) {
        nextDigits[index - 1] = "";
        applyDigits(nextDigits, index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextDigits = toDigits(pasted);
    applyDigits(nextDigits, Math.min(pasted.length, OTP_LENGTH - 1));
  }

  return (
    <div
      className="auth-otp-input"
      data-status={status}
      role="group"
      aria-labelledby={`${id}-label`}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          id={index === 0 ? id : `${id}-${index + 1}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          dir="ltr"
          disabled={disabled}
          aria-label={`رقم ${index + 1} از ${OTP_LENGTH}`}
          aria-invalid={ariaInvalid}
          value={digit}
          className={cn(
            "auth-otp-box",
            status === "idle" && focusedIndex === index && "auth-otp-box--active"
          )}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
