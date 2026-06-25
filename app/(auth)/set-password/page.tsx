import { AuthShell } from "@/components/auth/AuthShell";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";
import { resolveAuthNext } from "@/lib/auth-routes";

type SetPasswordPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SetPasswordPage({ searchParams }: SetPasswordPageProps) {
  const params = await searchParams;
  const next = resolveAuthNext(params);

  return (
    <AuthShell
      title="تنظیم رمز عبور"
      description="رمز عبور جدید خود را وارد کنید"
    >
      <SetPasswordForm next={next} />
    </AuthShell>
  );
}
