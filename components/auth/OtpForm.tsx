"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { OtpInput, OTP_LENGTH, type OtpInputStatus } from "@/components/auth/OtpInput";
import { useAuthSubmit } from "@/components/auth/useAuthSubmit";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { resendOtp, verifyOtp } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/errors";
import { saveTokens } from "@/lib/api/tokens";
import { appendNext } from "@/lib/auth-routes";

const RESEND_SECONDS = 120;

type OtpFormProps = {
  phone: string;
  next: string;
};

export function OtpForm({ phone, next }: OtpFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [otpStatus, setOtpStatus] = useState<OtpInputStatus>("idle");
  const { error, setError, loading, run } = useAuthSubmit();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const canResend = secondsLeft <= 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function handleCodeChange(value: string) {
    setCode(value);
    if (otpStatus === "error") {
      setOtpStatus("idle");
      setError("");
    }
  }

  async function handleResend() {
    setError("");
    setOtpStatus("idle");
    setCode("");
    try {
      await resendOtp(phone);
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = code.trim();
    if (trimmed.length !== OTP_LENGTH) {
      setOtpStatus("error");
      setError(`کد تأیید باید ${OTP_LENGTH} رقم باشد.`);
      return;
    }

    await run(async () => {
      try {
        const result = await verifyOtp(phone, trimmed);
        setOtpStatus("success");
        saveTokens(result.access, result.refresh);

        const destination = result.has_password
          ? appendNext("/set-password", next)
          : next;

        window.setTimeout(() => {
          router.push(destination);
        }, 450);
      } catch (err) {
        setOtpStatus("error");
        throw err;
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-5">
        <FieldDescription className="auth-note text-center text-sm">
          کد تأیید به شماره{" "}
          <span className="font-medium text-[var(--auth-fg)]" dir="ltr">
            {phone}
          </span>{" "}
          ارسال شد.
        </FieldDescription>

        <Field>
          <FieldLabel id="otp-code-label" htmlFor="otp-code">
            کد تأیید
          </FieldLabel>
          <OtpInput
            id="otp-code"
            value={code}
            onChange={handleCodeChange}
            status={otpStatus}
            disabled={loading || otpStatus === "success"}
            aria-invalid={otpStatus === "error" || !!error}
          />
          {error ? (
            <FieldError className="auth-otp-error">{error}</FieldError>
          ) : null}
        </Field>

        <Field>
          <AuthSubmitButton loading={loading}>تأیید</AuthSubmitButton>
        </Field>

        <div className="text-center text-sm">
          {canResend ? (
            <Button
              type="button"
              variant="link"
              className="auth-link h-auto p-0"
              onClick={handleResend}
              disabled={loading}
            >
              ارسال مجدد کد
            </Button>
          ) : (
            <span className="auth-note">
              ارسال مجدد کد تا {secondsLeft} ثانیه دیگر
            </span>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
