/**
 * GitHub Service for fetching repository content and markdown files
 */

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string;
  html_url: string;
}

const API_BASE_URL = 'https://api.github.com';

/**
 * Fetches repositories for a given user
 */
export const fetchUserRepos = async (
  username: string
): Promise<GitHubRepo[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${username}/repos?sort=updated&per_page=100`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch repositories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    throw error;
  }
};

/**
 * Fetches contents of a directory in a GitHub repository
 */
export const fetchRepoContents = async (
  owner: string,
  repo: string,
  path: string = ''
): Promise<GitHubFile[]> => {
  try {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Failed to fetch repository contents'
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching repository contents:', error);
    throw error;
  }
};

/**
 * Fetches and decodes a markdown file from a GitHub repository
 */
export const fetchMarkdownFile = async (
  owner: string,
  repo: string,
  path: string
): Promise<string> => {
  try {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch markdown file');
    }

    const data = await response.json();

    // GitHub API returns the content as base64 encoded
    if (data.encoding === 'base64' && data.content) {
      return atob(data.content);
    }

    throw new Error('Unsupported content encoding or empty content');
  } catch (error) {
    console.error('Error fetching markdown file:', error);
    throw error;
  }
};

/**
 * Parses a GitHub repository URL to extract owner and repo name
 */
export const parseGitHubUrl = (
  url: string
): { owner: string; repo: string } | null => {
  try {
    const githubRegex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(githubRegex);

    if (match && match.length >= 3) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
};
