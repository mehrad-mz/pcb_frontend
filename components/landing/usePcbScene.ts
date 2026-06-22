"use client";

import { useEffect, useRef } from "react";
import type { createPcbScrollScene } from "@/lib/pcb-scroll-scene";

export type PcbScene = ReturnType<typeof createPcbScrollScene>;

const SCENE_LOAD_TIMEOUT_MS = 12_000;
const RESIZE_DEBOUNCE_MS = 120;
const HIGH_POWER_FPS = 60;
const LOW_POWER_FPS = 20;
const LOOP_WAKE_MS = 1000;

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
  return (
    weakGpu ||
    cores <= 4 ||
    (typeof memory === "number" && memory <= 4)
  );
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

    const targetFps = lowPowerMode ? LOW_POWER_FPS : HIGH_POWER_FPS;
    let loopWakeIntervalId = 0;

    shell.setAttribute("data-gpu-tier", lowPowerMode ? "low" : "high");
    shell.closest(".landing-body")?.classList.toggle("landing-body--low-power", lowPowerMode);

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

      const isActive = scene.isScrollAnimating?.() ?? false;
      if (!isActive) {
        animating = false;
        return;
      }

      rafRef.current = requestAnimationFrame(animate);

      const frameInterval = 1000 / targetFps;
      if (now - lastFrameTime >= frameInterval) {
        lastFrameTime = now;
        scene.render();
      } else {
        scene.advanceScroll?.();
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

        loopWakeIntervalId = window.setInterval(() => {
          if (pcbRef.current?.isScrollAnimating?.()) {
            ensureAnimationLoop();
          }
        }, LOOP_WAKE_MS);

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
        finishLoading();
      });

    return () => {
      cancelled = true;
      clearTimeout(loadTimeoutId);
      clearTimeout(resizeTimeoutId);
      clearInterval(loopWakeIntervalId);
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
