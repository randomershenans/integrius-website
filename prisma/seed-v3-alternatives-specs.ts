/**
 * Seed v3: "Integrius vs X" and "X alternatives" article specs.
 * Extends the vendor-comparisons cluster with the highest commercial intent
 * searches there are: buyers comparing vendors head to head, and buyers
 * actively evaluating away from an incumbent.
 * Run: npm run db:seed-v3
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding v3: vs + alternatives specs...');

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

  const specs = [
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs Airbyte: Open Source ELT Meets Governed Data Products',
      slug: 'integrius-vs-airbyte',
      primary_keyword: 'Integrius vs Airbyte',
      secondary_keywords: ['Airbyte alternative', 'open source ELT governance', 'Airbyte vs governed data layer'],
      meta_title: 'Integrius vs Airbyte: Connector Breadth vs Governed Depth',
      meta_description: 'Airbyte moves data with hundreds of connectors. Integrius governs and serves it as stable APIs. Both self-host. Here is how to choose, honestly.',
      h2_structure: ['What Airbyte does well', 'What lands in your warehouse, and what does not', 'The governance gap after ingestion', 'What Integrius does differently', 'Self-hosted vs self-hosted: the real differences', 'Using Airbyte and Integrius together', 'Decision framework'],
      key_points: ['Airbyte: open source, huge connector catalogue, self-hostable', 'Airbyte moves data; it does not govern access or serve consumers', 'Integrius: governance enforced on the serving path, one API per business concept', 'Both self-host: differentiate on governance and serving, not hosting', 'Common pattern: Airbyte lands data, Integrius governs and serves it'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'See how a governed serving layer completes your ELT stack. Book a technical review.',
      internal_links: ['integrius-vs-fivetran', 'what-is-a-data-product', 'fivetran-alternatives'],
    },
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs Atlan: Active Metadata or Enforced Governance?',
      slug: 'integrius-vs-atlan',
      primary_keyword: 'Integrius vs Atlan',
      secondary_keywords: ['Atlan alternative', 'data catalog vs data platform', 'active metadata'],
      meta_title: 'Integrius vs Atlan: Catalogue or Runtime?',
      meta_description: 'Atlan documents your data estate beautifully. Integrius enforces governance on the serving path itself. The difference decides which one you need.',
      h2_structure: ['What Atlan does well', 'The structural limit of every catalogue', 'Catalogue drift: when documentation diverges from reality', 'What Integrius does differently', 'Governance that documents vs governance that executes', 'When to choose Atlan', 'When to choose Integrius'],
      key_points: ['Atlan: modern collaborative catalogue, strong modern-data-stack integrations', 'A catalogue describes data; it cannot stop an unapproved access', 'Integrius metadata IS the serving configuration, so it cannot drift', 'Integrius: self-hosted, audit chain, RBAC enforced at the API', 'Catalogues complement Integrius for documentation-led programmes'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'Governance that serves, not just documents. Book a demo.',
      internal_links: ['integrius-vs-collibra', 'data-product-governance', 'integrius-vs-alation'],
    },
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs Alation: Beyond the Data Catalogue',
      slug: 'integrius-vs-alation',
      primary_keyword: 'Integrius vs Alation',
      secondary_keywords: ['Alation alternative', 'data catalog comparison', 'data governance enforcement'],
      meta_title: 'Integrius vs Alation: Discovery or Delivery?',
      meta_description: 'Alation pioneered the data catalogue. Integrius is the governed runtime that serves data products. Different jobs: here is how to tell which is yours.',
      h2_structure: ['What Alation does well', 'Where catalogue-led governance stops', 'What Integrius does differently', 'Enforcement, audit, and the serving path', 'When to choose Alation', 'When to choose Integrius', 'Can they coexist?'],
      key_points: ['Alation: catalogue pioneer, query-log-driven discovery, strong stewardship', 'Catalogues advise; they do not enforce at the moment of access', 'Integrius: tamper-evident audit, RBAC at the API, self-hosted', 'Coexistence: catalogue for discovery, Integrius for governed delivery'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'See governance enforced on the serving path. Book a demo.',
      internal_links: ['integrius-vs-collibra', 'integrius-vs-atlan', 'data-product-governance'],
    },
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Integrius vs Informatica: One Platform or a Suite?',
      slug: 'integrius-vs-informatica',
      primary_keyword: 'Integrius vs Informatica',
      secondary_keywords: ['Informatica alternative', 'Informatica IDMC comparison', 'enterprise data management platform'],
      meta_title: 'Integrius vs Informatica: Suite Weight vs Sharp Tool',
      meta_description: 'Informatica spans ETL, MDM, quality and catalogue across a broad suite. Integrius is one self-hosted platform for governed data products. The comparison.',
      h2_structure: ['What Informatica does well', 'The cost of suite complexity', 'What Integrius does differently', 'Architecture comparison', 'Pricing model comparison', 'When to choose Informatica', 'When to choose Integrius', 'Migration considerations'],
      key_points: ['Informatica: broad enterprise suite, deep install base, consumption pricing', 'Suite complexity: separate products glued together', 'Integrius: one platform, per-data-product pricing, self-hosted', 'Days to first data product vs quarter-scale implementations'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'Compare Integrius to your current data management stack. Book a technical review.',
      internal_links: ['informatica-alternatives', 'integrius-vs-mulesoft', 'data-integration-cost-hidden-tax'],
    },
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Top Collibra Alternatives for Data Governance Teams',
      slug: 'collibra-alternatives',
      primary_keyword: 'Collibra alternatives',
      secondary_keywords: ['Collibra competitors', 'data catalog alternatives', 'data governance tools'],
      meta_title: 'Collibra Alternatives: 7 Options Compared Honestly',
      meta_description: 'Looking past Collibra? A fair comparison of Atlan, Alation, Purview, DataHub, OpenMetadata, Informatica and Integrius, organised by the job you need done.',
      h2_structure: ['Why teams look for Collibra alternatives', 'Atlan', 'Alation', 'Microsoft Purview', 'DataHub', 'OpenMetadata', 'Informatica', 'Integrius', 'Comparison table', 'Decision framework'],
      key_points: ['Catalogue cost and implementation weight drive churn', 'Catalogue drift: documentation diverges from reality', 'Open source options trade licence cost for engineering time', 'Integrius angle: governance enforced on the serving path, not documented beside it'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'If your real problem is governed access, not documentation, see Integrius.',
      internal_links: ['integrius-vs-collibra', 'integrius-vs-atlan', 'data-product-governance'],
    },
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Top MuleSoft Alternatives for Enterprise Integration',
      slug: 'mulesoft-alternatives',
      primary_keyword: 'MuleSoft alternatives',
      secondary_keywords: ['MuleSoft competitors', 'iPaaS alternatives', 'enterprise integration platforms'],
      meta_title: 'MuleSoft Alternatives: 6 Options by Job to Be Done',
      meta_description: 'Boomi, Workato, Apache Camel, Kong, lightweight automation, and Integrius: an honest guide to MuleSoft alternatives organised by what you actually need.',
      h2_structure: ['Why teams look for MuleSoft alternatives', 'Boomi', 'Workato', 'Apache Camel and open source', 'Kong and Apigee', 'Lightweight automation tools', 'Integrius', 'Comparison table', 'Decision framework'],
      key_points: ['Salesforce ecosystem gravity and services cost drive evaluation', 'Match the tool to the job: app integration, API management, or governed data access', 'Integrius angle: one governed API per business concept instead of N point-to-point integrations'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'If the integrations exist to move the same business data around, there is a better shape. See Integrius.',
      internal_links: ['integrius-vs-mulesoft', 'n-x-m-data-integration-problem', 'data-integration-cost-hidden-tax'],
    },
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Top Informatica Alternatives for Modern Data Teams',
      slug: 'informatica-alternatives',
      primary_keyword: 'Informatica alternatives',
      secondary_keywords: ['Informatica competitors', 'PowerCenter migration', 'IDMC alternatives'],
      meta_title: 'Informatica Alternatives: 7 Options Compared',
      meta_description: 'Talend, Fivetran, Airbyte, dbt, Purview, Ataccama and Integrius: a fair guide to Informatica alternatives organised by which part of the suite you use.',
      h2_structure: ['Why teams look for Informatica alternatives', 'Talend and Qlik', 'Fivetran and Airbyte', 'dbt', 'Microsoft Purview and Collibra', 'Ataccama', 'Integrius', 'Comparison table', 'Decision framework'],
      key_points: ['Suite complexity and consumption pricing drive evaluation', 'PowerCenter to IDMC migration is a natural decision point', 'Most teams use a slice of the suite; replace the slice, not the suite', 'Integrius angle: the governance-plus-delivery slice as one self-hosted platform'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'Replacing the governance and delivery slice? See Integrius.',
      internal_links: ['integrius-vs-informatica', 'integrius-vs-fivetran', 'self-hosted-data-governance'],
    },
    {
      article_type: 'pillar',
      search_intent: 'commercial',
      title: 'Top Fivetran Alternatives: ELT Tools and What Comes After',
      slug: 'fivetran-alternatives',
      primary_keyword: 'Fivetran alternatives',
      secondary_keywords: ['Fivetran competitors', 'Fivetran pricing', 'ELT tool comparison'],
      meta_title: 'Fivetran Alternatives: 7 Options Compared Honestly',
      meta_description: 'Airbyte, Stitch, Hevo, Meltano, Matillion, streaming options and Integrius: a fair guide to Fivetran alternatives organised by the job you need done.',
      h2_structure: ['Why teams look for Fivetran alternatives', 'Airbyte', 'Stitch', 'Hevo', 'Meltano', 'Matillion', 'Streaming options', 'Integrius', 'Comparison table', 'Decision framework'],
      key_points: ['MAR-based pricing scales with row volume and drives churn', 'Open source options trade licence cost for engineering time', 'ELT moves data; none of it governs what happens after landing', 'Integrius angle: when the goal is governed access across systems, not warehouse loading'],
      word_count_min: 2000,
      word_count_max: 2800,
      cta_text: 'If the pipeline exists to give consumers access to data, govern the access. See Integrius.',
      internal_links: ['integrius-vs-fivetran', 'integrius-vs-airbyte', 'n-x-m-data-integration-problem'],
    },
  ];

  for (const s of specs) {
    await prisma.cms_article_specs.upsert({
      where:  { slug: s.slug },
      update: {},
      create: {
        ...s,
        cluster_id: compareCluster.id,
        cta_text: s.cta_text ?? undefined,
      },
    });
    console.log('Spec:', s.slug);
  }

  console.log('\nV3 seed complete. Total new specs:', specs.length);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
