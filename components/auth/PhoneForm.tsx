"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useAuthSubmit } from "@/components/auth/useAuthSubmit";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { phoneCheck, sendOtp, validatePhone } from "@/lib/api/auth";
import { appendNext } from "@/lib/auth-routes";

type PhoneFormProps = {
  next: string;
};

export function PhoneForm({ next }: PhoneFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const { error, setError, loading, run } = useAuthSubmit();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = phone.trim();
    if (!validatePhone(trimmed)) {
      setError("شماره موبایل معتبر نیست.");
      return;
    }

    await run(async () => {
      await phoneCheck(trimmed, "otp");
      await sendOtp(trimmed);

      router.push(
        appendNext(`/login/verify?phone=${encodeURIComponent(trimmed)}`, next)
      );
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-5">
        {error ? <FieldError>{error}</FieldError> : null}

        <Field>
          <FieldLabel htmlFor="phone">شماره موبایل</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            className="h-10 text-left"
            placeholder="09123456789"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!error}
            required
          />
        </Field>

        <Field>
          <AuthSubmitButton loading={loading}>دریافت کد</AuthSubmitButton>
        </Field>

        <FieldDescription className="auth-note text-center text-xs leading-relaxed">
          در صورتی که تاکنون حساب کاربری نداشته‌اید، پس از تأیید شماره موبایل، حساب
          شما به‌صورت خودکار ساخته می‌شود.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
