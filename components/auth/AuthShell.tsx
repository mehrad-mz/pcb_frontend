import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AuthShell({ title, description, children, className }: AuthShellProps) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="auth-brand mb-8 inline-flex transition-opacity hover:opacity-90"
        aria-label="گلوبال PCB — صفحه اصلی"
      >
        <img
          src="/SIGNLOGOTYPE4.svg"
          alt="گلوبال PCB"
          className="auth-brand-logo"
        />
      </Link>

      <Card className={cn("auth-card w-full max-w-md rounded-2xl border-0 py-0", className)}>
        <CardHeader className="space-y-1.5 px-6 pt-8 pb-0 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-sm text-balance">{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="px-6 pt-6 pb-8">{children}</CardContent>
      </Card>
    </div>
  );
}
