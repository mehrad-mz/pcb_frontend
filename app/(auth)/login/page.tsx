import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { PhoneForm } from "@/components/auth/PhoneForm";
import { resolveAuthNext } from "@/lib/auth-routes";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = resolveAuthNext(params);

  return (
    <AuthShell
      title="ورود به حساب کاربری"
      description="برای ادامه شماره موبایل خود را وارد کنید"
    >
      <AuthTabs
        otpContent={<PhoneForm next={next} />}
        passwordContent={<PasswordForm next={next} />}
      />
    </AuthShell>
  );
}
