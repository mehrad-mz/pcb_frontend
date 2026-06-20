"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PERSIAN_DIGITS } from "@/lib/landing-data";

/** Scroll-driven stepper for `LandingOrderStages`. Use when that section is mounted on a page. */
export function useOrderStagesScroll(rootRef: React.RefObject<HTMLElement | null>, enabled = true) {
  const stateRef = useRef({ orderStep: -1 });

  useEffect(() => {
    if (!enabled || !rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const isMobile = () => mobileQuery.matches;
    const orderSteps = Array.from(rootRef.current.querySelectorAll(".landing-order-step"));
    const orderPin = rootRef.current.querySelector(".landing-order-pin");

    const setOrderStep = (step: number) => {
      if (step === stateRef.current.orderStep) return;
      stateRef.current.orderStep = step;
      orderSteps.forEach((item, index) => {
        const el = item as HTMLElement;
        const numEl = el.querySelector(".landing-order-num");
        el.classList.toggle("is-active", index === step);
        el.classList.toggle("is-done", index < step);
        if (numEl) numEl.textContent = index < step ? "✓" : PERSIAN_DIGITS[index];
      });
    };

    setOrderStep(0);

    const triggers: ScrollTrigger[] = [];

    if (orderPin && orderSteps.length) {
      const totalSteps = orderSteps.length;
      triggers.push(
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * totalSteps * (isMobile() ? 0.65 : 0.85)}`,
          pin: orderPin,
          pinReparent: true,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const step = Math.min(totalSteps - 1, Math.floor(self.progress * totalSteps));
            setOrderStep(step);
          },
        }),
      );
    }

    const refreshScroll = () => ScrollTrigger.refresh();
    const onResize = () => refreshScroll();

    window.addEventListener("resize", onResize);
    mobileQuery.addEventListener("change", onResize);
    refreshScroll();

    return () => {
      window.removeEventListener("resize", onResize);
      mobileQuery.removeEventListener("change", onResize);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [enabled, rootRef]);
}
