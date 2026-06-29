"use client";

import type { ReactNode } from "react";
import { useSceneReady } from "./landing-scene-context";

type LandingScrollMainProps = {
  children: ReactNode;
};

export default function LandingScrollMain({ children }: LandingScrollMainProps) {
  const sceneReady = useSceneReady();

  return (
    <main
      className="landing-scroll"
      id="landing-scroll"
      aria-hidden={sceneReady ? undefined : true}
    >
      {children}
    </main>
  );
}
