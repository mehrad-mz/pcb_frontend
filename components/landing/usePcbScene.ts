"use client";

import { useEffect, useRef } from "react";
import type { createPcbScrollScene } from "@/lib/pcb-scroll-scene";

export type PcbScene = ReturnType<typeof createPcbScrollScene>;

const SCENE_LOAD_TIMEOUT_MS = 12_000;

function signalSceneReady(onReady: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(onReady);
  });
}

export function usePcbScene(
  shellRef: React.RefObject<HTMLElement | null>,
  onReady: () => void,
) {
  const pcbRef = useRef<PcbScene | null>(null);
  const rafRef = useRef(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const canvas = shell.querySelector("#pcb-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    let cancelled = false;
    let listenersAttached = false;
    let loadTimeoutId = 0;

    const finishLoading = () => {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(loadTimeoutId);
      onReadyRef.current();
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const isMobile = () => mobileQuery.matches;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      pcbRef.current?.render();
    };

    const startAnimation = () => {
      cancelAnimationFrame(rafRef.current);
      animate();
    };

    const stopAnimation = () => {
      cancelAnimationFrame(rafRef.current);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    const onResize = () => {
      pcbRef.current?.resize();
    };

    loadTimeoutId = window.setTimeout(finishLoading, SCENE_LOAD_TIMEOUT_MS);

    import("@/lib/pcb-scroll-scene")
      .then(({ createPcbScrollScene }) => {
        if (cancelled) return;

        pcbRef.current = createPcbScrollScene(canvas, {
          prefersReducedMotion,
          isMobile: isMobile(),
          theme: "dark",
        });

        pcbRef.current.render();
        startAnimation();

        window.addEventListener("resize", onResize);
        mobileQuery.addEventListener("change", onResize);
        document.addEventListener("visibilitychange", onVisibilityChange);
        listenersAttached = true;

        signalSceneReady(finishLoading);
      })
      .catch((error) => {
        console.error("Landing 3D init failed:", error);
        finishLoading();
      });

    return () => {
      cancelled = true;
      clearTimeout(loadTimeoutId);
      stopAnimation();
      if (listenersAttached) {
        window.removeEventListener("resize", onResize);
        mobileQuery.removeEventListener("change", onResize);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      pcbRef.current = null;
    };
  }, [shellRef]);

  return pcbRef;
}
