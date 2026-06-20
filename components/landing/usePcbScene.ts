"use client";

import { useEffect, useRef } from "react";
import { detectSceneQuality } from "@/lib/pcb-scene-quality";
import type { createPcbScrollScene } from "@/lib/pcb-scroll-scene";

export type PcbScene = ReturnType<typeof createPcbScrollScene>;

const SCENE_LOAD_TIMEOUT_MS = 12_000;
const RESIZE_DEBOUNCE_MS = 120;
const ACTIVE_FPS = 60;

function signalSceneReady(onReady: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(onReady);
  });
}

function shouldRunAnimationLoop() {
  return !document.hidden && document.hasFocus();
}

function enableStaticFallback(shell: HTMLElement, canvas: HTMLCanvasElement) {
  canvas.classList.add("is-hidden");
  shell.classList.add("landing-shell--static-fallback");
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
    let resizeTimeoutId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let animating = false;
    let lastFrameTime = 0;

    const finishLoading = () => {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(loadTimeoutId);
      onReadyRef.current();
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const isMobile = () => mobileQuery.matches;

    const applyResize = () => {
      pcbRef.current?.resize();
      pcbRef.current?.render();
    };

    const scheduleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = window.setTimeout(applyResize, RESIZE_DEBOUNCE_MS);
    };

    const stopAnimation = () => {
      animating = false;
      cancelAnimationFrame(rafRef.current);
    };

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);

      if (!shouldRunAnimationLoop()) return;

      const scene = pcbRef.current;
      if (!scene) {
        stopAnimation();
        return;
      }

      if (!scene.isAnimating()) {
        scene.render();
        stopAnimation();
        return;
      }

      const frameInterval = 1000 / ACTIVE_FPS;
      if (now - lastFrameTime < frameInterval) return;

      lastFrameTime = now;
      scene.render();
    };

    const startAnimation = () => {
      if (prefersReducedMotion || animating) return;
      animating = true;
      lastFrameTime = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    const requestSceneFrame = () => {
      const scene = pcbRef.current;
      if (!scene) return;

      scene.render();

      if (!prefersReducedMotion && scene.isAnimating() && shouldRunAnimationLoop()) {
        startAnimation();
      }
    };

    const syncAnimationState = () => {
      if (prefersReducedMotion) return;

      if (shouldRunAnimationLoop()) {
        applyResize();
        if (pcbRef.current?.isAnimating()) {
          startAnimation();
        }
      } else {
        stopAnimation();
      }
    };

    const onVisibilityChange = () => {
      syncAnimationState();
    };

    const onWindowFocus = () => {
      syncAnimationState();
    };

    const onWindowBlur = () => {
      stopAnimation();
    };

    const onPageShow = () => {
      scheduleResize();
      syncAnimationState();
    };

    const onMobileChange = () => {
      scheduleResize();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      stopAnimation();
      enableStaticFallback(shell, canvas);
      pcbRef.current?.dispose?.();
      pcbRef.current = null;
    };

    canvas.addEventListener("webglcontextlost", onContextLost);

    loadTimeoutId = window.setTimeout(finishLoading, SCENE_LOAD_TIMEOUT_MS);

    import("@/lib/pcb-scroll-scene")
      .then(({ createPcbScrollScene }) => {
        if (cancelled) return;

        const quality = detectSceneQuality(isMobile());

        try {
          pcbRef.current = createPcbScrollScene(canvas, {
            prefersReducedMotion,
            isMobile: isMobile(),
            quality,
            theme: "dark",
            onNeedsFrame: requestSceneFrame,
          });
        } catch (error) {
          console.error("Landing 3D init failed:", error);
          enableStaticFallback(shell, canvas);
          signalSceneReady(finishLoading);
          return;
        }

        pcbRef.current.render();

        window.addEventListener("resize", scheduleResize);
        window.addEventListener("focus", onWindowFocus);
        window.addEventListener("blur", onWindowBlur);
        window.addEventListener("pageshow", onPageShow);
        mobileQuery.addEventListener("change", onMobileChange);
        document.addEventListener("visibilitychange", onVisibilityChange);

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(scheduleResize);
          resizeObserver.observe(canvas);
        }

        listenersAttached = true;
        signalSceneReady(finishLoading);
      })
      .catch((error) => {
        console.error("Landing 3D module failed:", error);
        enableStaticFallback(shell, canvas);
        finishLoading();
      });

    return () => {
      cancelled = true;
      clearTimeout(loadTimeoutId);
      clearTimeout(resizeTimeoutId);
      stopAnimation();
      resizeObserver?.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);

      if (listenersAttached) {
        window.removeEventListener("resize", scheduleResize);
        window.removeEventListener("focus", onWindowFocus);
        window.removeEventListener("blur", onWindowBlur);
        window.removeEventListener("pageshow", onPageShow);
        mobileQuery.removeEventListener("change", onMobileChange);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }

      pcbRef.current?.dispose?.();
      pcbRef.current = null;
    };
  }, [shellRef]);

  return pcbRef;
}
