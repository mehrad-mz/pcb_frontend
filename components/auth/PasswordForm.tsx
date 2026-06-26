"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useAuthSubmit } from "@/components/auth/useAuthSubmit";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { passwordLogin, validatePhone } from "@/lib/api/auth";
import { saveTokens } from "@/lib/api/tokens";
import { appendNext } from "@/lib/auth-routes";

type PasswordFormProps = {
  next: string;
};

export function PasswordForm({ next }: PasswordFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { error, setError, loading, run } = useAuthSubmit();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedPhone = phone.trim();
    if (!validatePhone(trimmedPhone)) {
      setError("شماره موبایل معتبر نیست.");
      return;
    }

    if (!password) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    await run(async () => {
      const result = await passwordLogin(trimmedPhone, password);
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

        <Field>
          <FieldLabel htmlFor="pwd-phone">شماره موبایل</FieldLabel>
          <Input
            id="pwd-phone"
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
          <FieldLabel htmlFor="pwd-password">رمز عبور</FieldLabel>
          <Input
            id="pwd-password"
            name="password"
            type="password"
            className="h-10"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            required
          />
        </Field>

        <Field>
          <AuthSubmitButton loading={loading}>ورود</AuthSubmitButton>
        </Field>
      </FieldGroup>
    </form>
  );
}
