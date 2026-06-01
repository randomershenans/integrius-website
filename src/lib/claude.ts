import Anthropic from '@anthropic-ai/sdk';
import { CircuitBreaker } from './circuit-breaker';

// NOTE: Rate limiting (e.g. per-user or per-minute caps) should be applied
// at the API route level, not inside this library module.

// Create the Anthropic client lazily (on first use) rather than at module load,
// so build-time page-data collection does not throw when ANTHROPIC_API_KEY is
// absent (e.g. Netlify deploy previews, which do not receive production
// secrets). A real generation request still fails closed: getClient() throws if
// the key is missing, and the calling route returns a 500.
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to your environment variables.'
    );
  }
  try {
    client = new Anthropic({ apiKey });
  } catch (err) {
    const masked = apiKey.length > 4 ? `...${apiKey.slice(-4)}` : '****';
    console.error(
      `Failed to initialise Anthropic client (key ending ${masked}):`,
      err
    );
    throw err;
  }
  return client;
}

const MODEL = 'claude-sonnet-4-20250514';

const API_TIMEOUT_MS = 30_000;

const claudeBreaker = new CircuitBreaker('Claude API');

export interface ArticleSpec {
  title: string;
  slug: string;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string;
  article_type: string;
  h2_structure: string[];
  key_points: string[];
  word_count_min: number;
  word_count_max: number;
  cta_text?: string | null;
  internal_links: string[];
}

export interface GeneratedArticle {
  content: string;
  excerpt: string;
  word_count: number;
  model: string;
  prompt_tokens: number;
  output_tokens: number;
}

function buildPrompt(spec: ArticleSpec): string {
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

WRITING RULES — follow every one of these without exception:
1. Problem-first. Lead with the pain the reader is experiencing. Integrius is the answer within the content, never the headline.
2. Answer the primary keyword query directly in the first 150 words.
3. Every factual claim must cite a named source (Gartner, Thoughtworks, MuleSoft, etc.). Do not invent statistics.
4. Write for CDOs, VP of Data, data engineers, and data architects. No fluff.
5. Short sentences. Short paragraphs. No paragraph longer than 4 lines.
6. NO EM DASHES. Do not use — anywhere in the article. Use a comma, a full stop, or a colon instead.
7. No buzzword-heavy opener. Do not start with "In today's fast-paced data landscape".
8. Avoid passive voice where possible.
9. Mention Integrius naturally as the platform that implements the architectural solution described. Do not open with it. Introduce it after establishing the problem and the solution approach.
10. Use concrete numbers and examples. Abstract claims do not rank.
11. Internal links: reference these articles naturally where relevant: ${spec.internal_links.length > 0 ? spec.internal_links.map(s => `/${s}`).join(', ') : 'none'}.
12. Write in UK English.
13. No em dashes. Seriously. Not a single one.

OUTPUT FORMAT:
Return ONLY the Markdown article body. No preamble, no "Here is the article", no meta commentary. Start directly with the H1 title. Use proper Markdown heading levels (# for H1, ## for H2, ### for H3).`;
}

function buildExcerptPrompt(title: string, content: string): string {
  return `Write a 1-2 sentence excerpt for this article. It should summarise the core problem addressed and hint at the solution. No em dashes. UK English. Under 160 characters total.

ARTICLE TITLE: ${title}

ARTICLE (first 500 words):
${content.slice(0, 1500)}

Return ONLY the excerpt text. No quotes. No preamble.`;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`API call timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export async function generateArticle(spec: ArticleSpec): Promise<GeneratedArticle> {
  const prompt = buildPrompt(spec);

  const response = await claudeBreaker.execute(() =>
    withTimeout(
      getClient().messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
      API_TIMEOUT_MS,
    ),
  );

  const content = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Strip any em dashes that slipped through (belt and braces)
  const cleaned = content.replace(/\u2014/g, ',').replace(/--/g, ',');

  // Generate excerpt
  const excerptResponse = await claudeBreaker.execute(() =>
    withTimeout(
      getClient().messages.create({
        model: MODEL,
        max_tokens: 100,
        messages: [{ role: 'user', content: buildExcerptPrompt(spec.title, cleaned) }],
      }),
      API_TIMEOUT_MS,
    ),
  );

  const excerpt = excerptResponse.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim();

  const word_count = cleaned.split(/\s+/).filter(Boolean).length;

  return {
    content: cleaned,
    excerpt,
    word_count,
    model: MODEL,
    prompt_tokens: response.usage.input_tokens + excerptResponse.usage.input_tokens,
    output_tokens: response.usage.output_tokens + excerptResponse.usage.output_tokens,
  };
}
