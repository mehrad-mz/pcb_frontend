"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthTab = "otp" | "password";

type AuthTabsProps = {
  activeTab?: AuthTab;
  otpContent: React.ReactNode;
  passwordContent: React.ReactNode;
};

export function AuthTabs({
  activeTab = "otp",
  otpContent,
  passwordContent,
}: AuthTabsProps) {
  const [tab, setTab] = useState<AuthTab>(activeTab);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const otpTriggerRef = useRef<HTMLButtonElement>(null);
  const passwordTriggerRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);
  const isAnimating = useRef(false);

  useLayoutEffect(() => {
    const activeTrigger = tab === "otp" ? otpTriggerRef.current : passwordTriggerRef.current;
    const indicator = indicatorRef.current;
    const list = listRef.current;

    if (!activeTrigger || !indicator || !list) return;

    const listRect = list.getBoundingClientRect();
    const triggerRect = activeTrigger.getBoundingClientRect();

    gsap.to(indicator, {
      x: triggerRect.left - listRect.left,
      width: triggerRect.width,
      duration: isFirstRender.current ? 0 : 0.35,
      ease: "power3.out",
    });

    isFirstRender.current = false;
  }, [tab]);

  function animatePanelChange(next: AuthTab) {
    if (next === tab || isAnimating.current) return;

    const panel = panelRef.current;
    if (!panel) {
      setTab(next);
      return;
    }

    isAnimating.current = true;

    gsap.to(panel, {
      opacity: 0,
      y: -10,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        setTab(next);
        gsap.fromTo(
          panel,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            ease: "power2.out",
            onComplete: () => {
              isAnimating.current = false;
            },
          }
        );
      },
    });
  }

  function handleTabChange(value: string | number | null) {
    if (value === "otp" || value === "password") {
      animatePanelChange(value);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs value={tab} onValueChange={handleTabChange} className="flex w-full flex-col gap-0">
        <TabsList
          ref={listRef}
          className="auth-tabs-list relative grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1"
        >
          <span
            ref={indicatorRef}
            className="auth-tabs-indicator pointer-events-none absolute top-1 bottom-1 left-0 rounded-lg"
            aria-hidden
          />

          <TabsTrigger
            ref={otpTriggerRef}
            value="otp"
            className="auth-tabs-trigger relative z-10 rounded-lg bg-transparent px-2 py-2.5 text-sm font-medium shadow-none data-active:bg-transparent data-active:shadow-none"
          >
            ورود با کد یکبار مصرف
          </TabsTrigger>
          <TabsTrigger
            ref={passwordTriggerRef}
            value="password"
            className="auth-tabs-trigger relative z-10 rounded-lg bg-transparent px-2 py-2.5 text-sm font-medium shadow-none data-active:bg-transparent data-active:shadow-none"
          >
            ورود با رمز عبور
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div ref={panelRef} className="auth-tabs-panel outline-none">
        {tab === "otp" ? otpContent : passwordContent}
      </div>
    </div>
  );
}
