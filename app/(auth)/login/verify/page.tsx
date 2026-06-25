import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { OtpForm } from "@/components/auth/OtpForm";
import { validatePhone } from "@/lib/api/auth";
import { resolveAuthNext } from "@/lib/auth-routes";

type VerifyPageProps = {
  searchParams: Promise<{ phone?: string; next?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const phone = params.phone?.trim();

  if (!phone || !validatePhone(phone)) {
    redirect("/login");
  }

  const next = resolveAuthNext(params);

  return (
    <AuthShell title="تأیید کد یکبار مصرف" description="کد ارسال‌شده را وارد کنید">
      <OtpForm phone={phone} next={next} />
    </AuthShell>
  );
}
