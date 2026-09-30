export type Project = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  year?: string | null;
  role?: string[];
  stack?: string[];
  image?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean;
};

export const projects: Project[] = [
  { id: "project-02", title: "PROJECT_02", eyebrow: "CASE STUDY / PENDING", description: "[Project description]", image: null, liveUrl: null, githubUrl: null },
  { id: "project-03", title: "PROJECT_03", eyebrow: "CASE STUDY / PENDING", description: "[Project description]", image: null, liveUrl: null, githubUrl: null },
];

/** Existing approved name; every other field remains explicitly unverified. */
export const featuredProject = {
  title: "VNNETZERO",
  image: "/projects/vnnetzero-placeholder.svg",
  imageAlt: "VNNETZERO project screenshot placeholder",
  role: "[Role pending]",
  stack: "[Stack pending]",
  status: "[Status pending]",
  projectUrl: null as string | null,
  githubUrl: null as string | null,
};
