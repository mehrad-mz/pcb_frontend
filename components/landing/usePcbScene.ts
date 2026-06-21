"use client";

import { useEffect, useRef } from "react";
import { debugGpuLog } from "@/lib/debug-gpu-log";
import type { createPcbScrollScene } from "@/lib/pcb-scroll-scene";

export type PcbScene = ReturnType<typeof createPcbScrollScene>;

const SCENE_LOAD_TIMEOUT_MS = 12_000;
const RESIZE_DEBOUNCE_MS = 120;
const HIGH_POWER_FPS = 60;
const LOW_POWER_FPS = 20;
const STATS_INTERVAL_MS = 5000;

function signalSceneReady(onReady: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(onReady);
  });
}

function detectGpuRenderer(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return null;
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
      ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string)
      : (gl.getParameter(gl.RENDERER) as string);
    return renderer.toLowerCase();
  } catch {
    return null;
  }
}

function isWeakIntegratedGpu(renderer: string | null): boolean {
  if (!renderer) return false;
  if (renderer.includes("apple m") || renderer.includes("apple gpu")) return false;
  if (renderer.includes("nvidia") || renderer.includes("geforce")) return false;
  if (renderer.includes("radeon rx") || renderer.includes("radeon pro")) return false;

  if (renderer.includes("intel")) {
    return (
      renderer.includes("uhd") ||
      renderer.includes("iris") ||
      renderer.includes("hd graphics") ||
      renderer.includes("arc a")
    );
  }

  return (
    renderer.includes("radeon") &&
    (renderer.includes("graphics") || renderer.includes("vega"))
  );
}

function detectLowPowerMode() {
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const gpuRenderer = detectGpuRenderer();
  const weakGpu = isWeakIntegratedGpu(gpuRenderer);
  const lowPowerMode =
    weakGpu ||
    cores <= 4 ||
    (typeof memory === "number" && memory <= 4);

  return { lowPowerMode, gpuRenderer, weakGpu };
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
    const { lowPowerMode, gpuRenderer, weakGpu } = detectLowPowerMode();

    // #region agent log
    debugGpuLog({
      location: "usePcbScene.ts:init",
      message: "Device capability snapshot",
      hypothesisId: "B",
      runId: "post-fix",
      data: {
        lowPowerMode,
        weakGpu,
        gpuRenderer,
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
    let rafTickCount = 0;
    let lastStatsAt = performance.now();
    let statsIntervalId = 0;
    const targetFps = lowPowerMode ? LOW_POWER_FPS : HIGH_POWER_FPS;

    shell.setAttribute("data-gpu-tier", lowPowerMode ? "low" : "high");
    shell.closest(".landing-body")?.classList.toggle("landing-body--low-power", lowPowerMode);

    const logStats = (now: number, extra: Record<string, unknown> = {}) => {
      const statsElapsed = now - lastStatsAt;
      if (statsElapsed < STATS_INTERVAL_MS) return;

      const sceneStats = pcbRef.current?.getDebugStats?.() ?? {};
      // #region agent log
      debugGpuLog({
        location: "usePcbScene.ts:stats",
        message: "5s render stats",
        hypothesisId: "A",
        runId: "post-fix-v3",
        data: {
          rendersPer5s: renderCount,
          rafTicksPer5s: rafTickCount,
          estimatedFps: (renderCount / statsElapsed) * 1000,
          rafLoopActive: animating && rafRef.current !== 0,
          isScrollAnimating: pcbRef.current?.isScrollAnimating?.() ?? null,
          targetFps,
          lowPowerMode,
          idleRenderingDisabled: true,
          animating,
          ...sceneStats,
          ...extra,
        },
      });
      // #endregion
      renderCount = 0;
      rafTickCount = 0;
      lastStatsAt = now;
    };

    const scheduleAnimationLoop = () => {
      if (prefersReducedMotion || !shouldRunAnimationLoop()) return;
      animating = true;
      if (!rafRef.current) {
        lastFrameTime = 0;
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const ensureAnimationLoop = () => {
      scheduleAnimationLoop();
    };

    const applyResize = () => {
      pcbRef.current?.resize();
      pcbRef.current?.render();
      ensureAnimationLoop();
    };

    const scheduleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = window.setTimeout(applyResize, RESIZE_DEBOUNCE_MS);
    };

    const animate = (now: number) => {
      rafRef.current = 0;
      if (!shouldRunAnimationLoop()) {
        animating = false;
        return;
      }

      const scene = pcbRef.current;
      if (!scene) {
        animating = false;
        return;
      }

      rafTickCount += 1;

      const isActive = scene.isScrollAnimating?.() ?? false;
      if (!isActive) {
        animating = false;
        logStats(now);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);

      const frameInterval = 1000 / targetFps;
      if (now - lastFrameTime >= frameInterval) {
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
        logStats(now, { lastRenderMs: renderMs });
      } else {
        scene.advanceScroll?.();
        logStats(now);
      }
    };

    const startAnimation = () => {
      scheduleAnimationLoop();
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

        const originalSetScrollTarget = pcbRef.current.setScrollTarget.bind(pcbRef.current);
        pcbRef.current.setScrollTarget = (target: number) => {
          originalSetScrollTarget(target);
          ensureAnimationLoop();
        };

        pcbRef.current.render();

        statsIntervalId = window.setInterval(() => {
          if (pcbRef.current?.isScrollAnimating?.()) {
            ensureAnimationLoop();
          }
          logStats(performance.now());
        }, STATS_INTERVAL_MS);

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
      clearInterval(statsIntervalId);
      stopAnimation();
      resizeObserver?.disconnect();
      shell.removeAttribute("data-gpu-tier");
      shell.closest(".landing-body")?.classList.remove("landing-body--low-power");

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
