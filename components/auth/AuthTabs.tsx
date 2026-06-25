"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthTabsProps = {
  activeTab?: "otp" | "password";
  otpContent: React.ReactNode;
};

export function AuthTabs({ activeTab = "otp", otpContent }: AuthTabsProps) {
  return (
    <Tabs defaultValue={activeTab} className="flex w-full flex-col gap-6">
      <TabsList className="auth-tabs-list grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1">
        <TabsTrigger
          value="otp"
          className="auth-tabs-trigger rounded-lg px-2 py-2.5 text-sm font-medium"
        >
          ورود با کد یکبار مصرف
        </TabsTrigger>
        <TabsTrigger
          value="password"
          disabled
          title="موقتاً غیرفعال"
          className="auth-tabs-trigger rounded-lg px-2 py-2.5 text-sm font-medium"
        >
          ورود با رمز عبور
        </TabsTrigger>
      </TabsList>

      <TabsContent value="otp" className="mt-0 outline-none">
        {otpContent}
      </TabsContent>

      <TabsContent value="password" className="mt-0 outline-none">
        <p className="auth-note text-center text-sm">
          ورود با رمز عبور موقتاً غیرفعال است.
        </p>
      </TabsContent>
    </Tabs>
  );
}
