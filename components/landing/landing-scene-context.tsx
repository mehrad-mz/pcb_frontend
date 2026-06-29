"use client";

import { createContext, useContext } from "react";

export const SceneReadyContext = createContext(false);

export function useSceneReady() {
  return useContext(SceneReadyContext);
}
