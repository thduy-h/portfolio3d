"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import { useRef } from "react";
import { NodeProgressContext, type NodeProgress } from "./node/NodeProgress";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HeroMotionProps = Readonly<{
  children: ReactNode;
  featuredProject: ReactNode;
}>;

export function HeroMotion({ children, featuredProject }: HeroMotionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const progressRef = useRef<NodeProgress>({
    available: null,
    explode: 0,
    focus: 0,
    handoff: 0,
    invalidate: () => {},
    target: null,
  });

  useGSAP(
    () => {
      const hero = heroRef.current;
      const progress = progressRef.current;

      if (!hero) {
        return;
      }

      const identity = hero.querySelector<HTMLElement>("[data-hero-identity]");
      const nodeStage = hero.querySelector<HTMLElement>("[data-node-stage]");
      const primaryUi = hero.querySelectorAll<HTMLElement>(
        "[data-node-primary-ui]",
      );
      const peripheralUi = hero.querySelectorAll<HTMLElement>(
        "[data-node-peripheral-ui]",
      );
      const identifiers = hero.querySelector<HTMLElement>(
        "[data-node-identifiers]",
      );
      const construction = hero.querySelector<HTMLElement>(
        "[data-node-construction]",
      );
      const project = hero.querySelector<HTMLElement>(
        "[data-featured-project]",
      );
      const lock = hero.querySelector<HTMLElement>("[data-node-lock]");
      const subsystems = hero.querySelector<HTMLElement>(
        "[data-node-subsystems]",
      );
      progress.target = hero.querySelector<HTMLDivElement>(
        "[data-project-screen]",
      );

      if (
        !identity ||
        !nodeStage ||
        !identifiers ||
        !construction ||
        !project ||
        !lock ||
        !subsystems
      ) {
        return;
      }

      let isActive = true;
      let refreshFrame: number | null = null;
      const refresh = () => ScrollTrigger.refresh();
      const refreshAfterLayout = () => {
        if (refreshFrame !== null) {
          cancelAnimationFrame(refreshFrame);
        }

        refreshFrame = requestAnimationFrame(() => {
          if (isActive) {
            refresh();
          }
        });
      };

      window.addEventListener("node-scene-ready", refreshAfterLayout);
      // Re-measure pinned layout on viewport changes even when the canvas keeps
      // its max-width and therefore does not emit a ResizeObserver update.
      window.addEventListener("resize", refreshAfterLayout);
      document.fonts.ready.then(() => {
        if (isActive) {
          refreshAfterLayout();
        }
      });

      const media = gsap.matchMedia();

      media.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (progress.available === false) return;
          hero.dataset.enhanced = "true";
          gsap.set(project, { autoAlpha: 0 });
          const centeredX = () => {
            const bounds = nodeStage.getBoundingClientRect();
            const currentX = Number(gsap.getProperty(nodeStage, "x")) || 0;
            const untransformedCenter =
              bounds.left + bounds.width / 2 - currentX;

            return window.innerWidth / 2 - untransformedCenter;
          };

          const centeredY = () => {
            const bounds = nodeStage.getBoundingClientRect();
            const currentY = Number(gsap.getProperty(nodeStage, "y")) || 0;
            const untransformedCenter =
              bounds.top + bounds.height / 2 - currentY;

            const heroBounds = hero.getBoundingClientRect();
            return (
              heroBounds.top + window.innerHeight / 2 - untransformedCenter
            );
          };

          gsap.set(nodeStage, { transformOrigin: "50% 50%" });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: () => {
              progress.invalidate();
              identity.inert =
                Number(gsap.getProperty(identity, "opacity")) < 0.05;
              project.inert = progress.handoff < 0.9;
            },
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "+=330%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              markers: false,
            },
          });

          timeline
            .to(
              identity,
              {
                opacity: 0,
                y: -28,
                scale: 0.985,
                duration: 0.35,
              },
              0,
            )
            .to(
              nodeStage,
              {
                x: centeredX,
                y: centeredY,
                scale: 1.12,
                duration: 0.5,
              },
              0.2,
            )
            .to(primaryUi, { opacity: 0.6, duration: 0.35 }, 0.65)
            .to(peripheralUi, { opacity: 0.28, duration: 0.35 }, 0.65)
            .to(construction, { opacity: 1, duration: 0.35 }, 0.65)
            .to(identifiers, { opacity: 0.48, duration: 0.25 }, 0.7)
            // Total 2.2 units over 330vh preserves chapter one's original 150vh.
            .to(lock, { opacity: 0.6, duration: 0.12 }, 1)
            .to(
              progress,
              { explode: 1, duration: 0.4, ease: "power2.inOut" },
              1.12,
            )
            .to(subsystems, { opacity: 0.65, duration: 0.25 }, 1.2)
            .to(lock, { opacity: 0, duration: 0.12 }, 1.25)
            .to(
              progress,
              { focus: 1, duration: 0.4, ease: "power2.inOut" },
              1.55,
            )
            .to(subsystems, { opacity: 0.2, duration: 0.25 }, 1.65)
            .to(
              [primaryUi, peripheralUi, identifiers],
              { opacity: 0.15, duration: 0.25 },
              1.7,
            )
            .to(progress, { handoff: 1, duration: 0.18 }, 1.95)
            .to(project, { autoAlpha: 1, duration: 0.18 }, 1.95)
            .to({}, { duration: 0.07 }, 2.13);

          const goToProject = (event: MouseEvent) => {
            const link = (event.target as Element).closest('a[href="#work"]');
            if (
              !link ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            window.scrollTo({
              top: timeline.scrollTrigger?.end ?? 0,
              behavior: "instant",
            });
          };
          document.addEventListener("click", goToProject);

          return () => {
            document.removeEventListener("click", goToProject);
            delete hero.dataset.enhanced;
            progress.explode = progress.focus = progress.handoff = 0;
            progress.invalidate();
            identity.inert = false;
            project.inert = false;
          };
        },
      );

      const unavailable = () => {
        media.revert();
        refreshAfterLayout();
      };
      window.addEventListener("node-scene-unavailable", unavailable);

      return () => {
        isActive = false;

        if (refreshFrame !== null) {
          cancelAnimationFrame(refreshFrame);
        }

        window.removeEventListener("node-scene-ready", refreshAfterLayout);
        window.removeEventListener("resize", refreshAfterLayout);
        window.removeEventListener("node-scene-unavailable", unavailable);
        media.revert();
      };
    },
    { scope: heroRef },
  );

  return (
    <NodeProgressContext.Provider value={progressRef}>
      <section
        ref={heroRef}
        className="node-story relative overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="hero-visual h-screen">{children}</div>
        <div
          id="work"
          data-featured-project
          className="featured-project relative mx-auto w-full px-6 py-16 lg:px-0"
        >
          {featuredProject}
        </div>
      </section>
    </NodeProgressContext.Provider>
  );
}
