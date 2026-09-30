import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NodeLab } from "@/components/node-lab/NodeLab";

export const metadata: Metadata = {
  title: "NODE_7388 — Geometry validation lab",
  robots: { index: false, follow: false },
};

export default function NodeLabPage() {
  // Isolated development route: not linked to the homepage or motion engine.
  if (process.env.NODE_ENV !== "development") notFound();
  return <NodeLab />;
}
