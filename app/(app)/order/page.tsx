"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getProfile, type UserProfile } from "@/lib/api/auth";

export default function OrderPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {
        router.replace("/login?next=/order");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <Card className="border-border/60 bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">ثبت سفارش PCB</CardTitle>
        <CardDescription>
          {profile?.phone ? (
            <>
              خوش آمدید{" "}
              <span dir="ltr" className="font-medium">
                {profile.phone}
              </span>
            </>
          ) : (
            "فرم سفارش به زودی در دسترس خواهد بود."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          صفحه سفارش‌گیری در حال توسعه است. به زودی می‌توانید فایل Gerber خود را
          آپلود کرده و سفارش ثبت کنید.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          بازگشت به صفحه اصلی
        </Link>
      </CardContent>
    </Card>
  );
}
