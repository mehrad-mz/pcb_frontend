"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PcbScene } from "./usePcbScene";

/** PCB trace progress bands across page sections (order matches DOM). */
const PCB_PROGRESS = {
  heroEnd: 0.06,
  productsEnd: 0.14,
  storyEnd: 0.38,
  featuresEnd: 0.55,
  pageEnd: 1,
} as const;

function lerpProgress(scrollProgress: number, rangeStart: number, rangeEnd: number): number {
  return rangeStart + gsap.utils.clamp(0, 1, scrollProgress) * (rangeEnd - rangeStart);
}

export function useLandingScroll(
  rootRef: React.RefObject<HTMLElement | null>,
  pcbRef: React.RefObject<PcbScene | null>,
  enabled: boolean,
) {
  const stateRef = useRef({ activeStep: 0, scrollTarget: 0 });

  useEffect(() => {
    if (!enabled || !rootRef.current || !pcbRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const isMobile = () => mobileQuery.matches;

    const stepperItems = Array.from(rootRef.current.querySelectorAll(".landing-stepper-item"));
    const storyPanels = Array.from(rootRef.current.querySelectorAll(".landing-story-panel"));

    const setStoryStep = (step: number) => {
      stateRef.current.activeStep = step;
      stepperItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === step);
        item.classList.toggle("is-complete", index < step);
      });
      storyPanels.forEach((panel, index) => {
        panel.classList.toggle("is-active", index === step);
      });
      pcbRef.current?.highlightMilestone(step);
    };

    const setScrollTarget = (target: number) => {
      const clamped = gsap.utils.clamp(0, 1, target);
      stateRef.current.scrollTarget = clamped;
      pcbRef.current?.setScrollTarget(clamped);
    };

    const applyPcbProgress = (self: ScrollTrigger, rangeStart: number, rangeEnd: number) => {
      if (!self.isActive) return;
      setScrollTarget(lerpProgress(self.progress, rangeStart, rangeEnd));
    };

    const triggers: ScrollTrigger[] = [];

    const addTrigger = (config: ScrollTrigger.Vars) => {
      triggers.push(ScrollTrigger.create(config));
    };

    setStoryStep(0);
    setScrollTarget(prefersReducedMotion ? 0.35 : 0);

    const landingScroll = rootRef.current.querySelector(".landing-scroll");

    const hero = rootRef.current.querySelector(".landing-hero");
    if (hero) {
      addTrigger({
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyPcbProgress(self, 0, PCB_PROGRESS.heroEnd),
      });
    }

    const storySection = rootRef.current.querySelector(".landing-story");
    const storySteps = stepperItems.length;
    const storyPin = rootRef.current.querySelector(".landing-story-pin");

    if (storySection && storyPin) {
      addTrigger({
        trigger: storySection,
        start: "top top",
        end: () => `+=${window.innerHeight * storySteps * (isMobile() ? 0.85 : 1)}`,
        pin: storyPin,
        pinReparent: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const step = Math.min(storySteps - 1, Math.floor(self.progress * storySteps));
          if (step !== stateRef.current.activeStep) setStoryStep(step);
          applyPcbProgress(self, PCB_PROGRESS.productsEnd, PCB_PROGRESS.storyEnd);
        },
      });
    }

    const products = rootRef.current.querySelector(".landing-products");
    if (products) {
      addTrigger({
        trigger: products,
        start: "top 90%",
        end: "bottom 60%",
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyPcbProgress(self, PCB_PROGRESS.heroEnd, PCB_PROGRESS.productsEnd),
      });
    }

    const features = rootRef.current.querySelector(".landing-features");
    if (features) {
      addTrigger({
        trigger: features,
        start: "top 80%",
        end: "bottom 30%",
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyPcbProgress(self, PCB_PROGRESS.storyEnd, PCB_PROGRESS.featuresEnd),
      });
    }

    const cta = rootRef.current.querySelector(".landing-cta");
    if (cta && landingScroll) {
      addTrigger({
        trigger: cta,
        start: "top 85%",
        endTrigger: landingScroll,
        end: "bottom bottom",
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyPcbProgress(self, PCB_PROGRESS.featuresEnd, PCB_PROGRESS.pageEnd),
        onLeave: () => setScrollTarget(PCB_PROGRESS.pageEnd),
      });
    }

    const refreshScroll = () => ScrollTrigger.refresh();

    const onResize = () => {
      refreshScroll();
    };

    window.addEventListener("resize", onResize);
    mobileQuery.addEventListener("change", onResize);
    refreshScroll();
    requestAnimationFrame(refreshScroll);
    const refreshTimeoutId = window.setTimeout(refreshScroll, 150);

    return () => {
      window.clearTimeout(refreshTimeoutId);
      window.removeEventListener("resize", onResize);
      mobileQuery.removeEventListener("change", onResize);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [enabled, rootRef, pcbRef]);
}
