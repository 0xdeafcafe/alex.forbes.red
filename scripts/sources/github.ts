// GitHub repo metadata. For each project URL we know about, fetch stargazers,
// fork count, primary language, and last-pushed timestamp. Public API is
// rate-limited to 60 req/h unauthenticated — the project list is small (~8
// repos) so that's plenty of headroom.

import { sleep } from '../lib/http.js';
import type { GithubRepoStats } from '../lib/types.js';

const UA = 'Mozilla/5.0 (compatible; alex-forbes-red/1.0)';

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

async function fetchOne(url: string): Promise<GithubRepoStats | null> {
  const parsed = parseRepoUrl(url);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'user-agent': UA,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
      },
    });
    if (!r.ok) {
      console.warn(`[github] ${owner}/${repo} -> ${r.status}`);
      return null;
    }
    const j = await r.json() as any;
    return {
      url,
      owner,
      repo,
      stars: j.stargazers_count ?? 0,
      forks: j.forks_count ?? 0,
      watchers: j.subscribers_count ?? 0,
      language: j.language ?? null,
      description: j.description ?? null,
      pushedAt: j.pushed_at ?? null,
      topics: Array.isArray(j.topics) ? j.topics.slice(0, 6) : [],
      archived: !!j.archived,
    };
  } catch (e) {
    console.warn(`[github] ${owner}/${repo} failed: ${(e as Error).message}`);
    return null;
  }
}

export async function fetchProjectStats(urls: string[]): Promise<GithubRepoStats[]> {
  const out: GithubRepoStats[] = [];
  for (const url of urls) {
    const stat = await fetchOne(url);
    if (stat) out.push(stat);
    // Tiny delay between requests to be polite — well within the public limit.
    await sleep(150);
  }
  console.log(`[github] fetched stats for ${out.length}/${urls.length} repos`);
  return out;
}
