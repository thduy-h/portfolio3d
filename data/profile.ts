/** Only approved information belongs here. Bracketed copy is explicitly provisional. */
export type Profile = {
  name: string | null;
  summary: string;
  focus: string | null;
  disciplines: string[];
  interests: string[];
  location: string | null;
};

export const profile: Profile = {
  name: null,
  summary: "[Profile summary — add an approved engineering narrative here]",
  focus: null,
  disciplines: [],
  interests: [],
  location: null,
};
