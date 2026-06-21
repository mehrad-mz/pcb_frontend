"use client";

import { useEffect, useRef } from "react";
import { debugGpuLog } from "@/lib/debug-gpu-log";
import type { createPcbScrollScene } from "@/lib/pcb-scroll-scene";

export type PcbScene = ReturnType<typeof createPcbScrollScene>;

const SCENE_LOAD_TIMEOUT_MS = 12_000;
const RESIZE_DEBOUNCE_MS = 120;
const IDLE_FPS = 30;
const ACTIVE_FPS = 60;

function signalSceneReady(onReady: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(onReady);
  });
}

function detectLowPowerMode() {
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return cores <= 4 || (typeof memory === "number" && memory <= 4);
}

function shouldRunAnimationLoop() {
  return !document.hidden && document.hasFocus();
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
    const lowPowerMode = detectLowPowerMode();

    // #region agent log
    debugGpuLog({
      location: "usePcbScene.ts:init",
      message: "Device capability snapshot",
      hypothesisId: "B",
      data: {
        lowPowerMode,
        isMobile: isMobile(),
        prefersReducedMotion,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
    });
    // #endregion

    let renderCount = 0;
    let lastStatsAt = performance.now();

    const applyResize = () => {
      pcbRef.current?.resize();
      pcbRef.current?.render();
    };

    const scheduleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = window.setTimeout(applyResize, RESIZE_DEBOUNCE_MS);
    };

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (!shouldRunAnimationLoop()) return;

      const scene = pcbRef.current;
      if (!scene) return;

      const isActive = scene.isScrollAnimating?.() ?? false;
      const targetFps = isActive ? ACTIVE_FPS : IDLE_FPS;
      const frameInterval = 1000 / targetFps;
      if (now - lastFrameTime < frameInterval) return;

      lastFrameTime = now;
      renderCount += 1;
      const renderStarted = performance.now();
      try {
        scene.render();
      } catch (error) {
        // #region agent log
        debugGpuLog({
          location: "usePcbScene.ts:animate",
          message: "Render threw error",
          hypothesisId: "D",
          data: {
            error: error instanceof Error ? error.message : String(error),
            renderCount,
            isScrollAnimating: scene.isScrollAnimating?.() ?? null,
          },
        });
        // #endregion
      }
      const renderMs = performance.now() - renderStarted;

      const statsElapsed = now - lastStatsAt;
      if (statsElapsed >= 5000) {
        const sceneStats = scene.getDebugStats?.() ?? {};
        // #region agent log
        debugGpuLog({
          location: "usePcbScene.ts:animate",
          message: "5s render stats",
          hypothesisId: "A",
          data: {
            rendersPer5s: renderCount,
            estimatedFps: (renderCount / statsElapsed) * 1000,
            isScrollAnimating: scene.isScrollAnimating?.() ?? null,
            targetFps: isActive ? ACTIVE_FPS : IDLE_FPS,
            lastRenderMs: renderMs,
            animating,
            ...sceneStats,
          },
        });
        // #endregion
        renderCount = 0;
        lastStatsAt = now;
      }
    };

    const startAnimation = () => {
      if (prefersReducedMotion || animating) return;
      animating = true;
      lastFrameTime = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      animating = false;
      cancelAnimationFrame(rafRef.current);
    };

    const syncAnimationState = () => {
      if (prefersReducedMotion) return;

      if (shouldRunAnimationLoop()) {
        applyResize();
        startAnimation();
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

    loadTimeoutId = window.setTimeout(finishLoading, SCENE_LOAD_TIMEOUT_MS);

    import("@/lib/pcb-scroll-scene")
      .then(({ createPcbScrollScene }) => {
        if (cancelled) return;

        pcbRef.current = createPcbScrollScene(canvas, {
          prefersReducedMotion,
          isMobile: isMobile(),
          lowPowerMode,
          theme: "dark",
        });

        pcbRef.current.render();

        if (!prefersReducedMotion && shouldRunAnimationLoop()) {
          startAnimation();
        }

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
        console.error("Landing 3D init failed:", error);
        // #region agent log
        debugGpuLog({
          location: "usePcbScene.ts:init-failed",
          message: "WebGL scene init failed",
          hypothesisId: "D",
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        // #endregion
        finishLoading();
      });

    return () => {
      cancelled = true;
      clearTimeout(loadTimeoutId);
      clearTimeout(resizeTimeoutId);
      stopAnimation();
      resizeObserver?.disconnect();

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
