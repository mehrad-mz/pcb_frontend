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

function getStoryStep(progress: number, totalSteps: number): number {
  if (totalSteps <= 1) return 0;
  return Math.min(totalSteps - 1, Math.floor(gsap.utils.clamp(0, 1, progress) * totalSteps));
}

function getStoryScrollDistance(totalSteps: number, isMobile: boolean): number {
  return window.innerHeight * totalSteps * (isMobile ? 0.85 : 1);
}

function restorePinProgress(trigger: ScrollTrigger, progress: number) {
  const clamped = gsap.utils.clamp(0, 1, progress);
  const targetScroll = trigger.start + (trigger.end - trigger.start) * clamped;
  if (Math.abs(window.scrollY - targetScroll) > 1) {
    window.scrollTo(0, targetScroll);
  }
}

const RESIZE_DEBOUNCE_MS = 150;

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
    const storySteps = stepperItems.length;

    const setStoryStep = (step: number) => {
      const clampedStep = gsap.utils.clamp(0, Math.max(storySteps - 1, 0), step);
      stateRef.current.activeStep = clampedStep;
      stepperItems.forEach((item, index) => {
        item.classList.toggle("is-active", index === clampedStep);
        item.classList.toggle("is-complete", index < clampedStep);
      });
      storyPanels.forEach((panel, index) => {
        panel.classList.toggle("is-active", index === clampedStep);
      });
      pcbRef.current?.highlightMilestone(clampedStep);
    };

    const syncStoryStep = (progress: number) => {
      setStoryStep(getStoryStep(progress, storySteps));
    };

    const setScrollTarget = (target: number) => {
      const clamped = gsap.utils.clamp(0, 1, target);
      stateRef.current.scrollTarget = clamped;
      pcbRef.current?.setScrollTarget(clamped);
    };

    /** PCB bands in DOM order — first active section wins (avoids late triggers jumping progress). */
    const pcbBands: Array<{ trigger: ScrollTrigger; rangeStart: number; rangeEnd: number }> = [];

    const syncPcbProgress = () => {
      for (const band of pcbBands) {
        if (band.trigger.isActive) {
          setScrollTarget(lerpProgress(band.trigger.progress, band.rangeStart, band.rangeEnd));
          return;
        }
      }
    };

    const triggers: ScrollTrigger[] = [];

    const addPcbTrigger = (config: ScrollTrigger.Vars, rangeStart: number, rangeEnd: number) => {
      const trigger = ScrollTrigger.create({
        ...config,
        onUpdate: (self) => {
          config.onUpdate?.(self);
          syncPcbProgress();
        },
      });
      triggers.push(trigger);
      pcbBands.push({ trigger, rangeStart, rangeEnd });
    };

    setStoryStep(0);
    setScrollTarget(prefersReducedMotion ? 0.35 : 0);

    const landingScroll = rootRef.current.querySelector(".landing-scroll");

    const hero = rootRef.current.querySelector(".landing-hero");
    if (hero) {
      addPcbTrigger(
        {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
        0,
        PCB_PROGRESS.heroEnd,
      );
    }

    const products = rootRef.current.querySelector(".landing-products");
    if (products) {
      addPcbTrigger(
        {
          trigger: products,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
        PCB_PROGRESS.heroEnd,
        PCB_PROGRESS.productsEnd,
      );
    }

    const storySection = rootRef.current.querySelector(".landing-story");
    const storyPin = rootRef.current.querySelector(".landing-story-pin");
    let storyTrigger: ScrollTrigger | null = null;

    if (storySection && storyPin && storySteps > 0) {
      storyTrigger = ScrollTrigger.create({
        trigger: storySection,
        start: "top top",
        end: () => `+=${getStoryScrollDistance(storySteps, isMobile())}`,
        pin: storyPin,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          syncStoryStep(self.progress);
        },
        onUpdate: (self) => {
          syncStoryStep(self.progress);
          syncPcbProgress();
        },
      });
      triggers.push(storyTrigger);
      pcbBands.push({
        trigger: storyTrigger,
        rangeStart: PCB_PROGRESS.productsEnd,
        rangeEnd: PCB_PROGRESS.storyEnd,
      });
    }

    const features = rootRef.current.querySelector(".landing-features");
    if (features) {
      addPcbTrigger(
        {
          trigger: features,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
        PCB_PROGRESS.storyEnd,
        PCB_PROGRESS.featuresEnd,
      );
    }

    const cta = rootRef.current.querySelector(".landing-cta");
    if (cta && landingScroll) {
      const ctaTrigger = ScrollTrigger.create({
        trigger: cta,
        start: "top top",
        endTrigger: landingScroll,
        end: "bottom bottom",
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: () => syncPcbProgress(),
        onLeave: () => setScrollTarget(PCB_PROGRESS.pageEnd),
      });
      triggers.push(ctaTrigger);
      pcbBands.push({
        trigger: ctaTrigger,
        rangeStart: PCB_PROGRESS.featuresEnd,
        rangeEnd: PCB_PROGRESS.pageEnd,
      });
    }

    const refreshScroll = () => {
      ScrollTrigger.refresh();
      syncPcbProgress();
    };

    let resizeTimeoutId = 0;
    const onResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = window.setTimeout(() => {
        const savedStoryProgress =
          storyTrigger &&
          window.scrollY >= storyTrigger.start &&
          window.scrollY <= storyTrigger.end
            ? storyTrigger.progress
            : null;

        ScrollTrigger.refresh();

        if (storyTrigger && savedStoryProgress !== null) {
          restorePinProgress(storyTrigger, savedStoryProgress);
          ScrollTrigger.refresh();
          syncStoryStep(storyTrigger.progress);
        } else if (storyTrigger) {
          syncStoryStep(storyTrigger.progress);
        }

        syncPcbProgress();
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", onResize);
    mobileQuery.addEventListener("change", onResize);
    refreshScroll();
    requestAnimationFrame(refreshScroll);
    const refreshTimeoutId = window.setTimeout(refreshScroll, 150);

    return () => {
      window.clearTimeout(refreshTimeoutId);
      window.clearTimeout(resizeTimeoutId);
      window.removeEventListener("resize", onResize);
      mobileQuery.removeEventListener("change", onResize);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [enabled, rootRef, pcbRef]);
}
