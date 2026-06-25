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
import { setPassword } from "@/lib/api/auth";

type SetPasswordFormProps = {
  next: string;
};

export function SetPasswordForm({ next }: SetPasswordFormProps) {
  const router = useRouter();
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { error, setError, loading, run } = useAuthSubmit();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    await run(async () => {
      await setPassword(password, confirmPassword);
      router.push(next);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-5">
        {error ? <FieldError>{error}</FieldError> : null}

        <FieldDescription className="auth-note text-center text-sm">
          برای ادامه، یک رمز عبور برای حساب خود تنظیم کنید.
        </FieldDescription>

        <Field>
          <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            className="h-10"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            minLength={8}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">تکرار رمز عبور</FieldLabel>
          <Input
            id="confirm-password"
            name="confirm_password"
            type="password"
            className="h-10"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </Field>

        <Field>
          <AuthSubmitButton loading={loading}>تنظیم رمز عبور</AuthSubmitButton>
        </Field>
      </FieldGroup>
    </form>
  );
}
