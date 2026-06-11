// ─────────────────────────────────────────────────────────────────────────────
// Minimal GitHub REST v3 client for the git-native blog, using plain fetch.
// No SDK dependency. The SEO brain uses this to open content PRs: publishing
// an article means a human merges the PR and Netlify rebuilds the static site.
//
// Required env vars:
//   GITHUB_TOKEN        repo-scoped personal access token
//   GITHUB_REPO         "owner/repo", e.g. "randomershenans/integrius-website"
//   GITHUB_BASE_BRANCH  optional, defaults to "master"
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = 'https://api.github.com';

export interface SeoPullRequest {
  number: number;
  title: string;
  html_url: string;
  head_branch: string;
  created_at: string;
}

export function isGitHubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

function repoSlug(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo || !repo.includes('/')) {
    throw new Error('GITHUB_REPO is not set (expected "owner/repo").');
  }
  return repo;
}

export function baseBranch(): string {
  return process.env.GITHUB_BASE_BRANCH || 'master';
}

interface GitHubError extends Error {
  status?: number;
}

async function ghFetch(path: string, init?: RequestInit): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set.');

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err: GitHubError = new Error(
      `GitHub API ${init?.method ?? 'GET'} ${path} failed (HTTP ${res.status}): ${body.slice(0, 400)}`,
    );
    err.status = res.status;
    throw err;
  }

  // 204 No Content and friends
  if (res.status === 204) return null;
  return res.json();
}

/** SHA of the tip of a branch (defaults to the configured base branch). */
export async function getBranchSha(branch = baseBranch()): Promise<string> {
  const data = await ghFetch(
    `/repos/${repoSlug()}/git/ref/heads/${encodeURIComponent(branch)}`,
  ) as { object?: { sha?: string } };
  const sha = data?.object?.sha;
  if (!sha) throw new Error(`Could not resolve SHA for branch "${branch}".`);
  return sha;
}

/**
 * Create a branch at the given SHA. Returns false (without throwing) when the
 * branch already exists, so callers can retry with a suffixed name.
 */
export async function createBranch(name: string, fromSha: string): Promise<boolean> {
  try {
    await ghFetch(`/repos/${repoSlug()}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${name}`, sha: fromSha }),
    });
    return true;
  } catch (err) {
    const status = (err as GitHubError).status;
    const message = err instanceof Error ? err.message : '';
    if (status === 422 && /already exists/i.test(message)) return false;
    throw err;
  }
}

/**
 * Create a branch named `prefix`, suffixing -2, -3, ... if it already exists.
 * Returns the branch name actually created.
 */
export async function createUniqueBranch(prefix: string, fromSha: string): Promise<string> {
  for (let attempt = 1; attempt <= 9; attempt++) {
    const name = attempt === 1 ? prefix : `${prefix}-${attempt}`;
    if (await createBranch(name, fromSha)) return name;
  }
  throw new Error(`Could not create a unique branch from prefix "${prefix}" after 9 attempts.`);
}

/** Create a file on a branch (one commit per call). Content is plain UTF-8. */
export async function createFileOnBranch(
  path: string,
  content: string,
  branch: string,
  message: string,
): Promise<void> {
  await ghFetch(`/repos/${repoSlug()}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
    }),
  });
}

/** Open a pull request from `head` into the base branch. Returns its URL and number. */
export async function openPullRequest(
  head: string,
  title: string,
  body: string,
): Promise<{ url: string; number: number }> {
  const data = await ghFetch(`/repos/${repoSlug()}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, head, base: baseBranch(), body }),
  }) as { html_url?: string; number?: number };

  if (!data?.html_url || typeof data.number !== 'number') {
    throw new Error('GitHub PR creation returned an unexpected response.');
  }
  return { url: data.html_url, number: data.number };
}

/** Open PRs whose head branch starts with "seo-brain/". */
export async function listOpenSeoBrainPRs(): Promise<SeoPullRequest[]> {
  const data = await ghFetch(
    `/repos/${repoSlug()}/pulls?state=open&per_page=50&sort=created&direction=desc`,
  ) as Array<{
    number?: number;
    title?: string;
    html_url?: string;
    created_at?: string;
    head?: { ref?: string };
  }>;

  if (!Array.isArray(data)) return [];

  return data
    .filter(pr => (pr.head?.ref ?? '').startsWith('seo-brain/'))
    .map(pr => ({
      number: pr.number ?? 0,
      title: pr.title ?? '',
      html_url: pr.html_url ?? '',
      head_branch: pr.head?.ref ?? '',
      created_at: pr.created_at ?? '',
    }));
}
