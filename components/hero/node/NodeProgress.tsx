"use client";

import { createContext, useContext, type RefObject } from "react";

export type NodeProgress = {
  available: boolean | null;
  explode: number;
  focus: number;
  handoff: number;
  invalidate: () => void;
  target: HTMLDivElement | null;
};

export const NodeProgressContext =
  createContext<RefObject<NodeProgress> | null>(null);

export function useNodeProgress() {
  const progress = useContext(NodeProgressContext);
  if (!progress) throw new Error("NODE requires HeroMotion context");
  return progress;
}
