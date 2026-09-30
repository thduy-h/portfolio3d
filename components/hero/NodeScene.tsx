"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { NodeFallback } from "./node/NodeFallback";
import { useNodeProgress } from "./node/NodeProgress";

const NodeCanvas = dynamic(() => import("./node/NodeCanvas"), { ssr: false });
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? <NodeFallback /> : this.props.children;
  }
}
export function NodeScene() {
  const progressRef = useNodeProgress();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    progressRef.current.available = false;
    setFailed(true);
    window.dispatchEvent(new Event("node-scene-unavailable"));
  }, [progressRef]);
  useEffect(() => {
    const query = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => {
      if (!query.matches) {
        setEnabled(false);
        return;
      }
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2");
      if (!context) {
        onFailure();
        return;
      }
      context.getExtension("WEBGL_lose_context")?.loseContext();
      progressRef.current.available = true;
      setEnabled(true);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [onFailure, progressRef]);
  return (
    <div
      className="relative h-full w-full"
      role="img"
      aria-label="NODE_7388: six hardware faces surrounding SYS_CORE"
    >
      {enabled && !failed && (
        <SceneBoundary onFailure={onFailure}>
          <NodeCanvas onReady={onReady} onFailure={onFailure} />
        </SceneBoundary>
      )}
      {(!enabled || !ready || failed) && (
        <div className="absolute inset-0">
          <NodeFallback loading={enabled && !failed && !ready} />
        </div>
      )}
    </div>
  );
}
