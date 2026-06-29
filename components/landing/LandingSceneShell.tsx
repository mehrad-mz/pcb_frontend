"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import LandingSceneLoader from "./LandingSceneLoader";
import { SceneReadyContext } from "./landing-scene-context";
import { useLandingScroll } from "./useLandingScroll";
import { usePcbScene } from "./usePcbScene";

type LandingSceneShellProps = {
  children: ReactNode;
};

export default function LandingSceneShell({ children }: LandingSceneShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const pcbRef = usePcbScene(shellRef, handleSceneReady);
  useLandingScroll(shellRef, pcbRef, sceneReady);

  return (
    <SceneReadyContext.Provider value={sceneReady}>
      <div className={`landing-body${sceneReady ? "" : " landing-body--loading"}`}>
        <div
          className={`landing-shell${sceneReady ? " landing-shell--ready" : ""}`}
          id="landing-shell"
          ref={shellRef}
        >
          <canvas id="pcb-canvas" aria-hidden="true" />
          <div className="landing-vignette" aria-hidden="true" />

          {!sceneReady ? <LandingSceneLoader /> : null}

          {children}
        </div>
      </div>
    </SceneReadyContext.Provider>
  );
}
