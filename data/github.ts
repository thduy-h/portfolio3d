export type ContributionDay = { date: string; level: 0 | 1 | 2 | 3 | 4 };
export type RepositoryHighlight = { name: string; description: string | null; url: string | null; language: string | null };

/** Only user-supplied or verified data should populate these collections. */
export const githubData: {
  contributions: ContributionDay[];
  repositories: RepositoryHighlight[];
} = { contributions: [], repositories: [] };
