import { githubData, type ContributionDay, type RepositoryHighlight } from "@/data/github";
import { social } from "@/data/social";

export type GitHubSnapshot =
  | { status: "unconfigured" | "empty" | "error"; username: string | null; contributions: []; repositories: []; message?: string }
  | { status: "ready"; username: string; contributions: ContributionDay[]; repositories: RepositoryHighlight[] };

/** Server-side boundary. No outbound request occurs without a configured account. */
export function getGitHubSnapshot(): GitHubSnapshot {
  if (!social.githubUsername) {
    return { status: "unconfigured", username: null, contributions: [], repositories: [] };
  }
  try {
    // Real collection can be connected here after username and source are approved.
    // The current data file accepts verified contributions and repository highlights.
    if (githubData.contributions.length === 0 && githubData.repositories.length === 0) {
      return { status: "empty", username: social.githubUsername, contributions: [], repositories: [] };
    }
    return { status: "ready", username: social.githubUsername, ...githubData };
  } catch {
    return { status: "error", username: social.githubUsername, contributions: [], repositories: [], message: "GitHub data could not be loaded." };
  }
}
