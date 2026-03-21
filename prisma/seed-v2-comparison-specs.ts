/**
 * Seed v2 — Comparison, use-case, and "how to" article specs.
 * These target commercial-intent and job-to-be-done searches:
 * buyers comparing vendors, architects looking for how-to guidance.
 * Run: npm run db:seed-v2
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding v2 — comparison + use-case specs...');

  // Fetch existing cluster IDs by slug
  const clusters = await prisma.cms_keyword_clusters.findMany({
    select: { id: true, slug: true },
  });
  const clusterMap = Object.fromEntries(clusters.map(c => [c.slug, c.id]));

  // Ensure a "Vendor Comparisons" cluster exists
  const compareCluster = await prisma.cms_keyword_clusters.upsert({
    where: { slug: 'vendor-comparisons' },
    update: {},
    create: {
      name: 'Vendor Comparisons',
      slug: 'vendor-comparisons',
      description: 'Integrius vs competitor pages and vendor shortlist guides. High commercial intent.',
      sort_order: 7,
    },
  });
  clusterMap['vendor-comparisons'] = compareCluster.id;

  const useCaseCluster = await prisma.cms_keyword_clusters.upsert({
    where: { slug: 'use-cases' },
    update: {},
    create: {
      name: 'Use Cases & How-To',
      slug: 'use-cases',
      description: 'Job-to-be-done articles. How to connect X to Y. Practitioner-level how-to guides.',
      sort_order: 8,
    },
  });
  clusterMap['use-cases'] = useCaseCluster.id;

  const specs = [
    // ── Comparison specs (commercial intent) ─────────────────────────────────
    {
      cluster_slug: 'vendor-comparisons',
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs MuleSoft: Which Data Integration Platform Is Right for You?',
      slug: 'integrius-vs-mulesoft',
      primary_keyword: 'Integrius vs MuleSoft',
      secondary_keywords: ['MuleSoft alternative', 'MuleSoft pricing too expensive', 'data integration platform comparison'],
      meta_title: 'Integrius vs MuleSoft (2026): Feature, Price & Architecture Comparison',
      meta_description: 'MuleSoft costs 100K-2M/yr and locks you into Salesforce. Integrius is self-hosted, governed by default, and priced per data product. Here is the real comparison.',
      h2_structure: ['What MuleSoft does well', 'Where MuleSoft falls short', 'What Integrius does differently', 'Architecture comparison: ESB vs governed data layer', 'Pricing comparison', 'When to choose MuleSoft', 'When to choose Integrius', 'Migration path from MuleSoft'],
      key_points: ['MuleSoft: 100K-2M/yr, Salesforce-owned, ESB architecture', 'Integrius: per-data-product pricing, self-hosted, governed layer', 'MuleSoft is connector-first; Integrius is governance-first', 'MuleSoft requires Anypoint Platform lock-in', 'Integrius works alongside existing MuleSoft investments', 'Average MuleSoft implementation: 6-18 months; Integrius: first data product in days'],
      word_count_min: 2000,
      word_count_max: 3000,
      cta_text: 'Compare Integrius to your current stack. Book a technical review.',
      internal_links: ['data-integration-challenges-enterprise', 'data-integration-cost-hidden-tax'],
    },
    {
      cluster_slug: 'vendor-comparisons',
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs Fivetran: Beyond the Connector',
      slug: 'integrius-vs-fivetran',
      primary_keyword: 'Integrius vs Fivetran',
      secondary_keywords: ['Fivetran alternative', 'Fivetran expensive', 'ELT vs governed data layer'],
      meta_title: 'Integrius vs Fivetran (2026): When ELT Is Not Enough',
      meta_description: 'Fivetran moves data. Integrius governs it. If you need raw replication, Fivetran is fine. If you need governed data products with access control and lineage, you need something else.',
      h2_structure: ['What Fivetran actually does', 'What Fivetran does not do', 'The governance gap Fivetran leaves open', 'Integrius: governance-first, not connector-first', 'Can you use both?', 'Pricing model comparison', 'Decision framework'],
      key_points: ['Fivetran: per-connector, per-row pricing — costs scale with data volume', 'Fivetran has no governance layer — data lands in warehouse, ungoverned', 'Integrius is not an ETL tool — it governs what lands downstream', 'Common architecture: Fivetran for ingestion, Integrius for governed serving layer', 'Fivetran does not provide access control, lineage, or approval workflows'],
      word_count_min: 1800,
      word_count_max: 2500,
      cta_text: 'See how Integrius complements or replaces your current ELT stack.',
      internal_links: ['what-is-governed-data-layer', 'n-x-m-data-integration-problem'],
    },
    {
      cluster_slug: 'vendor-comparisons',
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs Palantir Foundry: Enterprise Data Platforms Compared',
      slug: 'integrius-vs-palantir-foundry',
      primary_keyword: 'Integrius vs Palantir Foundry',
      secondary_keywords: ['Palantir Foundry alternative', 'Palantir Foundry pricing', 'enterprise data platform comparison'],
      meta_title: 'Integrius vs Palantir Foundry (2026): Honest Comparison',
      meta_description: 'Palantir Foundry costs 5-50M/yr and takes 12+ months to implement. Integrius is self-hosted, deploys in days, and does not require a Palantir consulting army.',
      h2_structure: ['What Palantir Foundry is', 'Palantir pricing: the real numbers', 'Implementation reality: what Palantir actually takes', 'What Integrius does differently', 'Feature comparison table', 'The sovereignty question', 'Who should use Foundry', 'Who should use Integrius'],
      key_points: ['Palantir Foundry: 5-50M/yr, government and large enterprise only', 'Typical Foundry implementation: 12-24 months, requires Palantir Forward Deployed Engineers', 'Integrius: self-hosted, first data product live in under a week', 'Foundry is a full operating system; Integrius is a governed data layer', 'Integrius works alongside existing BI, ML, and analytics tools', 'Sovereignty: Integrius air-gapped mode vs Foundry SaaS dependency'],
      word_count_min: 2000,
      word_count_max: 3000,
      cta_text: 'See Integrius deployed in your environment. No army of consultants required.',
      internal_links: ['self-hosted-data-governance', 'air-gapped-deployment-explained'],
    },
    {
      cluster_slug: 'vendor-comparisons',
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs Collibra: Data Governance Platform Comparison',
      slug: 'integrius-vs-collibra',
      primary_keyword: 'Integrius vs Collibra',
      secondary_keywords: ['Collibra alternative', 'data governance platform comparison', 'data catalog vs data products'],
      meta_title: 'Integrius vs Collibra (2026): Active Governance vs Passive Cataloguing',
      meta_description: 'Collibra documents your data. Integrius governs it in motion. If your governance tool does not enforce access control and lineage at query time, it is a compliance theatre.',
      h2_structure: ['What Collibra does', 'The passive cataloguing problem', 'Active governance: what it actually means', 'Integrius governance model', 'Feature comparison', 'Integration: can they work together?', 'Pricing comparison', 'Decision guide'],
      key_points: ['Collibra: data catalog and metadata management, 200K-1M+/yr', 'Collibra is passive — it documents policies but does not enforce them', 'Integrius enforces governance at the API layer — every query is governed', 'Collibra has no data product serving capability', 'Integrius auto-generates a data catalog as a byproduct of governance', 'Both can coexist: Collibra for business glossary, Integrius for governed serving'],
      word_count_min: 1800,
      word_count_max: 2500,
      cta_text: 'Move from cataloguing to active governance. See Integrius.',
      internal_links: ['data-product-governance', 'field-level-access-control-data'],
    },
    {
      cluster_slug: 'vendor-comparisons',
      article_type: 'faq',
      search_intent: 'commercial',
      title: 'Integrius vs dbt: What Is the Difference?',
      slug: 'integrius-vs-dbt',
      primary_keyword: 'Integrius vs dbt',
      secondary_keywords: ['dbt alternative', 'dbt vs data products', 'transformation vs governance'],
      meta_title: 'Integrius vs dbt: Transformation vs Governed Serving',
      meta_description: 'dbt transforms data inside your warehouse. Integrius governs what gets served out of it. They solve different problems and most serious teams use both.',
      key_points: ['dbt: SQL transformation inside the warehouse, open source, widely adopted', 'dbt has no API serving layer — outputs are warehouse tables, not governed APIs', 'Integrius: governed API serving, access control, lineage, consumer subscriptions', 'Common architecture: dbt transforms → Integrius governs and serves', 'dbt does not provide field-level access control or approval workflows', 'They are complementary, not competing'],
      word_count_min: 600,
      word_count_max: 900,
      cta_text: null,
      internal_links: ['what-is-governed-data-layer', 'data-product-governance'],
    },
    // ── Use case + how-to specs (job-to-be-done) ─────────────────────────────
    {
      cluster_slug: 'use-cases',
      article_type: 'pillar',
      search_intent: 'navigational',
      title: 'How to Connect Salesforce to Snowflake Without Breaking Everything',
      slug: 'connect-salesforce-to-snowflake',
      primary_keyword: 'connect Salesforce to Snowflake',
      secondary_keywords: ['Salesforce Snowflake integration', 'Salesforce data to data warehouse', 'CRM data product'],
      meta_title: 'How to Connect Salesforce to Snowflake (The Governed Way)',
      meta_description: 'Copying Salesforce data to Snowflake is the easy part. Making it trustworthy, access-controlled, and schema-stable for every downstream consumer is the hard part. Here is how.',
      h2_structure: ['Why Salesforce-to-Snowflake breaks in production', 'The naive approach: direct connectors and why they fail', 'The governed approach: Salesforce as a source, not the destination', 'Field mapping and normalisation', 'Access control: not every consumer should see every field', 'Schema change management', 'Step-by-step with Integrius', 'Monitoring and alerting'],
      key_points: ['Salesforce schema changes 3-4x/year — point-to-point connectors break', 'PII in Salesforce (phone, email, address) requires field-level access control downstream', 'A governed data product abstracts Salesforce schema from consumers', 'Consumer contracts mean Salesforce schema changes do not cascade', 'Blast radius analysis before any field removal', 'One Salesforce data product, N consumers — no duplicated connectors'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'Connect your CRM to your data layer with full governance. See Integrius.',
      internal_links: ['blast-radius-analysis-data', 'field-level-access-control-data', 'n-x-m-data-integration-problem'],
    },
    {
      cluster_slug: 'use-cases',
      article_type: 'pillar',
      search_intent: 'navigational',
      title: 'How to Build a Customer 360 Data Product',
      slug: 'build-customer-360-data-product',
      primary_keyword: 'customer 360 data product',
      secondary_keywords: ['customer 360 implementation', 'unified customer view data', 'customer data product architecture'],
      meta_title: 'How to Build a Customer 360 Data Product (Not Just a View)',
      meta_description: 'A Customer 360 view in a dashboard is not a data product. A governed Customer 360 API with access control, lineage, and consumer contracts is. Here is the difference and how to build it.',
      h2_structure: ['What a Customer 360 actually means vs what vendors sell you', 'Why a dashboard view is not a data product', 'Sources: CRM, support, billing, product telemetry', 'Entity key strategy: choosing your customer identifier', 'Field mapping and normalisation across sources', 'Access control: who gets what fields', 'Consumer subscriptions and SLAs', 'Implementation steps with Integrius'],
      key_points: ['Customer 360 typically requires joining: Salesforce, Zendesk, Stripe, product DB', 'Entity key: customer_id must be consistent across all sources', 'Finance sees LTV and billing; support sees tickets; marketing sees engagement', 'GDPR: right to erasure must propagate through the governed product', 'A governed Customer 360 responds to a single API call with all consumer-relevant fields', 'Real-time vs batch: governed products can serve both from the same definition'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'Build your Customer 360 as a governed data product. See Integrius.',
      internal_links: ['entity-key-joining-data', 'what-is-a-data-product', 'field-level-access-control-data'],
    },
    {
      cluster_slug: 'use-cases',
      article_type: 'pillar',
      search_intent: 'navigational',
      title: 'How to Prepare Your Data Infrastructure for AI (Without Rebuilding It)',
      slug: 'data-infrastructure-for-ai-readiness',
      primary_keyword: 'data infrastructure for AI readiness',
      secondary_keywords: ['AI data readiness', 'prepare data for LLM', 'AI data governance', 'enterprise AI data layer'],
      meta_title: 'How to Prepare Your Data Infrastructure for AI in 2026',
      meta_description: 'Your AI models are only as good as the data you feed them. 73% of enterprise AI projects fail because of data quality and access issues, not model issues. Here is the architecture fix.',
      h2_structure: ['Why enterprise AI fails: it is a data problem, not a model problem', 'What AI actually needs from your data infrastructure', 'The three data quality killers: inconsistency, duplicates, ungoverned access', 'Governed data products as AI context: why it matters', 'Retrieval-augmented generation needs governed, real-time data', 'Building the governed data layer before the AI layer', 'Audit trails: why AI data provenance will become a compliance requirement', 'Step-by-step AI readiness assessment'],
      key_points: ['73% of enterprise AI projects fail due to data issues (Gartner 2024)', 'LLMs fed ungoverned data hallucinate more, not less', 'RAG requires a real-time, governed, queryable data layer — not a stale warehouse', 'Every AI output needs a data lineage trail for compliance and explainability', 'Governed data products serve as structured context for AI agents', 'Access control applies to AI consumers too — not every model should see every field'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'Build your AI-ready data layer. See how Integrius connects to LLM pipelines.',
      internal_links: ['data-integration-for-ai', 'what-is-governed-data-layer', 'data-product-governance'],
    },
    {
      cluster_slug: 'use-cases',
      article_type: 'faq',
      search_intent: 'informational',
      title: 'What Is a Data Contract and Why Does It Matter?',
      slug: 'what-is-a-data-contract',
      primary_keyword: 'what is a data contract',
      secondary_keywords: ['data contract definition', 'data contract examples', 'consumer data contract'],
      meta_title: 'What Is a Data Contract? Definition, Examples, and Why It Matters',
      meta_description: 'A data contract is a formal agreement between a data producer and consumer defining schema, SLAs, access scope, and change notification. Without it, every schema change is a surprise.',
      key_points: ['A data contract defines: schema, SLA, access scope, change notification terms', 'Without contracts, schema changes are surprises that break downstream systems', 'Consumer subscribes to a specific version of a data product schema', 'Breaking change = producer must notify all subscribed consumers before deployment', 'Data contracts are enforced at the API layer, not in documentation', 'Integrius generates consumer contracts automatically from field mapping definitions'],
      word_count_min: 600,
      word_count_max: 900,
      cta_text: null,
      internal_links: ['what-is-a-data-product', 'blast-radius-analysis-data'],
    },
    {
      cluster_slug: 'use-cases',
      article_type: 'faq',
      search_intent: 'informational',
      title: 'What Is Data Lineage and How Do You Implement It?',
      slug: 'what-is-data-lineage',
      primary_keyword: 'what is data lineage',
      secondary_keywords: ['data lineage definition', 'data lineage tools', 'end-to-end data lineage'],
      meta_title: 'What Is Data Lineage? Definition, Types, and How to Implement It',
      meta_description: 'Data lineage tracks every transformation from source to consumer. It is how you answer "where did this number come from?" in an audit, a regulatory review, or a post-incident review.',
      key_points: ['Lineage tracks: source system, transformation logic, destination, and timestamp', 'Column-level lineage: which source field maps to which output field', 'Required for: GDPR Article 30, HIPAA audit trails, SOX compliance', 'Forward lineage: what breaks if I change this field?', 'Backward lineage: where did this value come from?', 'Governed data platforms capture lineage automatically — no manual documentation'],
      word_count_min: 600,
      word_count_max: 900,
      cta_text: null,
      internal_links: ['blast-radius-analysis-data', 'data-product-governance'],
    },
  ];

  for (const s of specs) {
    const { cluster_slug, ...rest } = s;
    const clusterId = clusterMap[cluster_slug];
    if (!clusterId) { console.warn(`No cluster found for slug: ${cluster_slug}`); continue; }

    await prisma.cms_article_specs.upsert({
      where:  { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        cluster_id:    clusterId,
        word_count_min: rest.word_count_min ?? 600,
        word_count_max: rest.word_count_max ?? 900,
        h2_structure:   (rest as { h2_structure?: string[] }).h2_structure ?? [],
        internal_links: rest.internal_links ?? [],
        secondary_keywords: rest.secondary_keywords ?? [],
        cta_text: rest.cta_text ?? undefined,
      },
    });
    console.log('Spec:', rest.slug);
  }

  console.log('\nV2 seed complete. Total new specs:', specs.length);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
