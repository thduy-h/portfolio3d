# Liquid Compute Portfolio

An experimental 3D portfolio for AI and Computer Vision work, built with Next.js, React Three Fiber, Three.js, GSAP, and TypeScript.

The interface centers on an interactive **Node 7388** scene and pairs motion-rich presentation with conventional portfolio sections for projects, experience, technical stack, and contact information.

## Highlights

- Interactive WebGL hero built with React Three Fiber and Drei
- GSAP-driven motion and smooth scrolling
- Responsive fallbacks and reduced-motion support
- Dedicated Node Lab for inspecting the 3D asset
- Typed project, experience, profile, social, and stack data
- Static-friendly Next.js architecture

## Tech stack

- Next.js 16 and React 19
- TypeScript
- Three.js, React Three Fiber, and Drei
- GSAP
- Tailwind CSS
- Lenis

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Project structure

```text
app/                  Next.js routes and global styles
components/           UI, portfolio sections, and 3D scene components
data/                 Typed portfolio content
assets/node-7388/      Source and exported 3D assets
docs/                 Integration notes and visual validation
```

## Status

This repository is an experimental portfolio implementation. It is public for technical review and learning; no license is currently granted for redistribution.
