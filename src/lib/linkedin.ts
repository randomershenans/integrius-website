// LinkedIn company page auto-share
// Uses LinkedIn Marketing API v2 — UGC Posts endpoint

const LINKEDIN_API = 'https://api.linkedin.com/v2';

export interface ShareResult {
  success: boolean;
  post_url?: string;
  error?: string;
}

function buildHook(title: string, excerpt: string): string {
  // 2-3 sentence hook from the article for the LinkedIn post body
  const hook = excerpt.length > 0 ? excerpt : title;
  // Keep under 700 chars for optimal LinkedIn engagement
  return hook.slice(0, 680);
}

export async function shareToLinkedIn(article: {
  title: string;
  slug: string;
  excerpt: string;
}): Promise<ShareResult> {
  const accessToken   = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgId         = process.env.LINKEDIN_ORGANIZATION_ID;
  const siteUrl       = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';

  if (!accessToken || !orgId) {
    return { success: false, error: 'LINKEDIN_ACCESS_TOKEN or LINKEDIN_ORGANIZATION_ID not set' };
  }

  const articleUrl = `${siteUrl}/blog/${article.slug}`;
  const hook       = buildHook(article.title, article.excerpt);

  const body = {
    author: `urn:li:organization:${orgId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: `${hook}\n\nRead the full article: ${articleUrl}`,
        },
        shareMediaCategory: 'ARTICLE',
        media: [
          {
            status: 'READY',
            description: { text: article.excerpt.slice(0, 256) },
            originalUrl: articleUrl,
            title: { text: article.title },
          },
        ],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  try {
    const response = await fetch(`${LINKEDIN_API}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `LinkedIn API ${response.status}: ${text}` };
    }

    const data = await response.json() as { id?: string };
    const postId = data.id ?? '';
    const post_url = postId ? `https://www.linkedin.com/feed/update/${postId}/` : undefined;

    return { success: true, post_url };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
