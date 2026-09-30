export type ExperienceEntry = {
  id: string;
  company: string | null;
  position: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  skills: string[];
  location: string | null;
  links: { label: string; url: string }[];
};

/** Rows demonstrate the timeline without implying actual employment. */
export const experience: ExperienceEntry[] = [
  { id: "EXPERIENCE_01", company: null, position: null, startDate: null, endDate: null, description: "[Experience entry]", skills: [], location: null, links: [] },
  { id: "EXPERIENCE_02", company: null, position: null, startDate: null, endDate: null, description: "[Experience entry]", skills: [], location: null, links: [] },
];
