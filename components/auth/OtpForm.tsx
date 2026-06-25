"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useAuthSubmit } from "@/components/auth/useAuthSubmit";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  const { error, setError, loading, run } = useAuthSubmit();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const canResend = secondsLeft <= 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function handleResend() {
    setError("");
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
    if (!trimmed) {
      setError("کد تأیید را وارد کنید.");
      return;
    }

    await run(async () => {
      const result = await verifyOtp(phone, trimmed);
      saveTokens(result.access, result.refresh);

      if (result.has_password) {
        router.push(appendNext("/set-password", next));
      } else {
        router.push(next);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-5">
        {error ? <FieldError>{error}</FieldError> : null}

        <FieldDescription className="auth-note text-center text-sm">
          کد تأیید به شماره{" "}
          <span className="font-medium text-[var(--auth-fg)]" dir="ltr">
            {phone}
          </span>{" "}
          ارسال شد.
        </FieldDescription>

        <Field>
          <FieldLabel htmlFor="otp-code">کد تأیید</FieldLabel>
          <Input
            id="otp-code"
            name="otp_code"
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="h-10 text-center text-lg tracking-[0.3em]"
            placeholder="•••••"
            maxLength={6}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-invalid={!!error}
            required
          />
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
