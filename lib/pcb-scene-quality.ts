export type SceneQualityTier = "high" | "medium" | "low";

function getWebGlRendererString(): string | null {
  if (typeof document === "undefined") return null;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return null;

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;

    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
  } catch {
    return null;
  }
}

function isWeakGpuRenderer(renderer: string | null): boolean {
  if (!renderer) return true;
  return /Intel|Microsoft Basic|SwiftShader|Mesa|ANGLE.*Intel/i.test(renderer);
}

/** Picks WebGL quality tier for the landing PCB scene. */
export function detectSceneQuality(isMobile: boolean): SceneQualityTier {
  if (typeof window === "undefined") return "medium";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low";
  }

  if (isMobile) return "medium";

  const renderer = getWebGlRendererString();
  if (isWeakGpuRenderer(renderer)) return "low";

  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (cores <= 4 || (typeof memory === "number" && memory <= 4)) {
    return "low";
  }

  return "high";
}

export function getScenePixelRatio(quality: SceneQualityTier, isMobile: boolean): number {
  const dpr = window.devicePixelRatio || 1;
  if (quality === "low") return 1;
  if (quality === "medium") return Math.min(dpr, isMobile ? 1.25 : 1);
  return Math.min(dpr, isMobile ? 1.25 : 1.25);
}
