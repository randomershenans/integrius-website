// Netlify background function — runs up to 15 minutes, returns 202 immediately.
// Called by /api/admin/generate. Calls Anthropic directly (no SDK, no Prisma).
// On completion calls /api/admin/generate/complete to save the article via Next.js.

const MODEL = 'claude-sonnet-4-20250514';

function buildPrompt(spec) {
  const wordTarget = `${spec.word_count_min}-${spec.word_count_max}`;
  const isFaq = spec.article_type === 'faq';
  return `You are a senior B2B technology writer producing content for Integrius, a governed data layer and data products platform.

Write a ${isFaq ? 'concise FAQ/glossary article (300-500 words)' : `pillar article (${wordTarget} words)`} in Markdown format.

TITLE: ${spec.title}
PRIMARY KEYWORD: ${spec.primary_keyword}
SECONDARY KEYWORDS: ${spec.secondary_keywords.join(', ')}
SEARCH INTENT: ${spec.search_intent}

${isFaq ? '' : `H2 STRUCTURE (use these H2s in order):
${spec.h2_structure.map((h, i) => `${i + 1}. ${h}`).join('\n')}

`}REQUIRED POINTS TO COVER:
${spec.key_points.map(p => `- ${p}`).join('\n')}

${spec.cta_text ? `CLOSING CTA: End the article with this call to action: "${spec.cta_text}"` : ''}

WRITING RULES:
1. Problem-first. Lead with the pain the reader is experiencing. Integrius is the answer within the content, never the headline.
2. Answer the primary keyword query directly in the first 150 words.
3. Every factual claim must cite a named source (Gartner, Thoughtworks, MuleSoft, etc.). Do not invent statistics.
4. Write for CDOs, VP of Data, data engineers, and data architects. No fluff.
5. Short sentences. Short paragraphs. No paragraph longer than 4 lines.
6. NO EM DASHES. Do not use — anywhere in the article. Use a comma, a full stop, or a colon instead.
7. No buzzword-heavy opener. Do not start with "In today's fast-paced data landscape".
8. Avoid passive voice where possible.
9. Mention Integrius naturally as the platform that implements the architectural solution described. Do not open with it.
10. Use concrete numbers and examples. Abstract claims do not rank.
11. Internal links: reference these articles naturally where relevant: ${spec.internal_links.length > 0 ? spec.internal_links.map(s => `/${s}`).join(', ') : 'none'}.
12. Write in UK English.
13. No em dashes. Seriously. Not a single one.

OUTPUT FORMAT:
Return ONLY the Markdown article body. No preamble. Start directly with the H1 title. Use proper Markdown heading levels (# for H1, ## for H2, ### for H3).`;
}

function buildExcerptPrompt(title, content) {
  return `Write a 1-2 sentence excerpt for this article. Summarise the core problem addressed and hint at the solution. No em dashes. UK English. Under 160 characters total.

ARTICLE TITLE: ${title}

ARTICLE (first 1500 chars):
${content.slice(0, 1500)}

Return ONLY the excerpt text. No quotes. No preamble.`;
}

async function callClaude(prompt, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function notifyComplete(siteUrl, queue_id, payload) {
  await fetch(`${siteUrl}/api/admin/generate/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CMS_JWT_SECRET}`,
    },
    body: JSON.stringify({ queue_id, ...payload }),
  });
}

exports.handler = async (event) => {
  let queue_id, spec, site_url;
  try {
    ({ queue_id, spec, site_url } = JSON.parse(event.body || '{}'));
  } catch {
    return;
  }

  try {
    const articleRes = await callClaude(buildPrompt(spec), 4096);
    let content = articleRes.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');
    content = content.replace(/\u2014/g, ',').replace(/--/g, ',');

    const excerptRes = await callClaude(buildExcerptPrompt(spec.title, content), 150);
    const excerpt = excerptRes.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    const word_count = content.split(/\s+/).filter(Boolean).length;

    await notifyComplete(site_url, queue_id, {
      spec,
      content,
      excerpt,
      word_count,
      model: MODEL,
      prompt_tokens:  articleRes.usage.input_tokens  + excerptRes.usage.input_tokens,
      output_tokens:  articleRes.usage.output_tokens + excerptRes.usage.output_tokens,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Generation failed';
    await notifyComplete(site_url, queue_id, { error }).catch(() => {});
  }
};
