import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Note: import path uses the cms-specific generated client
// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CMS content bank...');

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminEmail    = process.env.CMS_ADMIN_EMAIL;
  const adminPassword = process.env.CMS_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) throw new Error('CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD env vars are required to seed');

  const existing = await prisma.cms_admin_users.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.cms_admin_users.create({
      data: {
        email: adminEmail,
        password_hash: await bcrypt.hash(adminPassword, 12),
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // ── Keyword clusters ──────────────────────────────────────────────────────
  const clusters = [
    { name: 'Data Integration Problems',   slug: 'data-integration',   description: 'Challenges, costs, failures, and architecture of enterprise data integration', sort_order: 1 },
    { name: 'Data Products & Data Mesh',   slug: 'data-products',      description: 'What data products are, how to build them, governance, composability', sort_order: 2 },
    { name: 'Enterprise Search',           slug: 'enterprise-search',  description: 'Why enterprise search fails, costs, comparison, the governed alternative', sort_order: 3 },
    { name: 'AI & Data Readiness',         slug: 'ai-data',            description: 'Why AI projects fail without good data, data pipelines, governance as AI prerequisite', sort_order: 4 },
    { name: 'Self-Hosted & Sovereignty',   slug: 'self-hosted',        description: 'On-premises, air-gapped, data sovereignty, EU Data Act, self-hosted vs SaaS', sort_order: 5 },
    { name: 'Industry Verticals',          slug: 'verticals',          description: 'Pharma, financial services, government, healthcare data integration', sort_order: 6 },
  ];

  const clusterMap: Record<string, string> = {};
  for (const c of clusters) {
    const record = await prisma.cms_keyword_clusters.upsert({
      where:  { slug: c.slug },
      update: {},
      create: c,
    });
    clusterMap[c.slug] = record.id;
    console.log(`Cluster: ${c.name}`);
  }

  // ── Article specs — Pillar articles ───────────────────────────────────────
  const pillars = [
    {
      cluster_slug: 'data-integration',
      article_type: 'pillar',
      title: '7 Data Integration Challenges Destroying Enterprise Agility in 2026',
      slug: 'data-integration-challenges-enterprise',
      primary_keyword: 'data integration challenges',
      secondary_keywords: ['enterprise data integration', 'data silo problems', 'integration complexity'],
      search_intent: 'informational',
      meta_title: '7 Data Integration Challenges Costing Enterprises Millions in 2026',
      meta_description: 'Enterprise data integration challenges are costing companies millions in wasted time and failed projects. Learn the 7 biggest problems and how governed data products solve them.',
      h2_structure: [
        'The Scale of the Problem: 897 Apps, 29% Integrated',
        'Challenge 1: Data Silos Create Blind Spots',
        'Challenge 2: Point-to-Point Integration Does Not Scale',
        'Challenge 3: Data Quality Degrades Without Governance',
        'Challenge 4: Integration Maintenance Eats Engineering Time',
        'Challenge 5: Real-Time Data Is Still a Pipe Dream',
        'Challenge 6: Compliance Without Lineage Is Guesswork',
        'Challenge 7: AI Initiatives Stall Without Unified Data',
        'The Architecture That Solves All Seven',
      ],
      key_points: [
        '897 apps average, only 29% integrated (MuleSoft/Integrate.io)',
        '80% of enterprise data in unstructured siloed formats (MarketsandMarkets)',
        '95% cite integration as primary AI adoption barrier',
        '64% cite data quality as top challenge (DATAVERSITY)',
        'Data engineers spend 40-80% of time on integration maintenance',
        'The N x M problem explained with real numbers',
        'Governed data products as the architectural solution',
        'Mention Integrius naturally as the platform that implements this',
      ],
      word_count_min: 1800,
      word_count_max: 2200,
      cta_text: 'See how a governed data layer eliminates these challenges. Explore Integrius.',
      internal_links: ['what-is-a-data-product', 'why-enterprise-search-sucks', 'data-integration-cost-hidden-tax'],
    },
    {
      cluster_slug: 'data-products',
      article_type: 'pillar',
      title: 'What Is a Data Product? The Complete Enterprise Guide',
      slug: 'what-is-a-data-product',
      primary_keyword: 'what is a data product',
      secondary_keywords: ['data products explained', 'data product definition', 'data product architecture', 'data mesh products'],
      search_intent: 'informational',
      meta_title: 'What Is a Data Product? The Complete Guide for Enterprise Data Teams',
      meta_description: 'A data product is a governed, API-accessible, composable unit of data with clear ownership. Learn what makes a data product different from a warehouse, a dashboard, or an ETL output.',
      h2_structure: [
        'Data Product Definition: What It Is (and What It Is Not)',
        'Data Product vs Data Warehouse vs Data Lake',
        'The Five Properties of a True Data Product',
        'Why Data Products Matter for AI Readiness',
        'How Data Products Solve the N x M Integration Problem',
        'Real-World Example: Customer Master as a Data Product',
        'How to Start Building Data Products',
      ],
      key_points: [
        'Gartner 2026 MQ now evaluates data product lifecycle governance',
        'Thoughtworks Jan 2026: data products are where the value becomes tangible',
        'Zhamak Dehghani (Data Mesh creator) founded Nextdata for data mesh-native tooling',
        'Five properties: Owned, Normalised, API-served, Documented, Governed',
        'Clear example showing Salesforce + Stripe + Zendesk unified into one /customer/{id} endpoint',
        'Composability: products that consume other products',
        'Position Integrius as the platform that makes data products real, not just theoretical',
      ],
      word_count_min: 1500,
      word_count_max: 2000,
      cta_text: 'Ready to build your first data product? See how Integrius makes it real.',
      internal_links: ['data-integration-challenges-enterprise', 'composable-data-products', 'data-mesh-vs-data-fabric'],
    },
    {
      cluster_slug: 'enterprise-search',
      article_type: 'pillar',
      title: 'Why Enterprise Search Still Sucks (And What Actually Fixes It)',
      slug: 'why-enterprise-search-sucks',
      primary_keyword: 'why is enterprise search bad',
      secondary_keywords: ['enterprise search problems', 'enterprise search solution', 'search ungoverned data', 'enterprise search cost'],
      search_intent: 'informational',
      meta_title: 'Why Enterprise Search Still Sucks in 2026 (And the Fix Nobody Talks About)',
      meta_description: 'Enterprise search fails because the data underneath is ungoverned. Learn why indexing ungoverned data is a losing game and how governed data products make search a byproduct.',
      h2_structure: [
        'The State of Enterprise Search in 2026',
        'Why Indexing Ungoverned Data Does Not Work',
        'What Enterprise Search Actually Costs (Elastic, Coveo, Glean)',
        'Search as a Byproduct of Governance',
        'How Federated Search Across Data Products Works',
        'The Cost Comparison: Governed Search vs Standalone Search',
      ],
      key_points: [
        'Elastic 50K-500K/yr, Coveo 100K-1M/yr, Glean 200K+/yr',
        'All require separate indexing infrastructure and maintenance',
        'The problem is not search. The problem is the data layer underneath',
        'When every source is connected and normalised, the index already exists',
        'One API call across all governed data products, real-time, access-controlled',
        'Integrius search: zero additional infrastructure, emergent from governance',
        'Security: users only see results they are authorised to see',
      ],
      word_count_min: 1200,
      word_count_max: 1500,
      cta_text: 'What if enterprise search cost you nothing? See how Integrius makes it a byproduct.',
      internal_links: ['what-is-a-data-product', 'data-integration-challenges-enterprise'],
    },
    {
      cluster_slug: 'ai-data',
      article_type: 'pillar',
      title: 'Why Your AI Initiative Is Failing (It Is Not the Model, It Is the Data)',
      slug: 'data-integration-for-ai',
      primary_keyword: 'data integration for AI',
      secondary_keywords: ['AI data readiness', 'AI data pipeline', 'data governance AI', 'why AI fails', 'AI data quality'],
      search_intent: 'informational',
      meta_title: 'Why AI Fails Without Data Integration: The Barrier 95% of Enterprises Face',
      meta_description: '95% of organisations cite data integration as their primary barrier to AI. Learn why AI-ready data requires governed data products, not more data lakes.',
      h2_structure: [
        'The Stat That Should Worry Every CIO',
        'Why AI Models Are Only as Good as Their Data',
        'Data Lakes Are Not AI-Ready Data',
        'What AI-Ready Data Actually Looks Like',
        'How Data Products Create AI-Ready Foundations',
        'The Governed Data Layer as AI Prerequisite',
      ],
      key_points: [
        '95% of IT leaders cite integration as primary AI barrier (Salesforce/Rapidi)',
        '64% cite data quality as top challenge, only 3% of enterprise data meets quality standards (HBR)',
        '80% of data governance initiatives predicted to fail by 2027',
        'Companies solving integration achieve 4x faster AI deployment (Integrate.io)',
        'AI-ready data: governed, unified, API-accessible, with lineage',
        'Data products serve clean training data through stable endpoints',
        'Position Integrius as the foundation layer AI initiatives need',
      ],
      word_count_min: 1500,
      word_count_max: 1800,
      cta_text: 'Build the data foundation your AI initiative needs. Explore Integrius.',
      internal_links: ['what-is-a-data-product', 'data-integration-challenges-enterprise'],
    },
    {
      cluster_slug: 'self-hosted',
      article_type: 'pillar',
      title: 'Why Self-Hosted Data Governance Is Winning the Enterprise Market',
      slug: 'self-hosted-data-governance',
      primary_keyword: 'self-hosted data platform',
      secondary_keywords: ['on-premises data integration', 'data sovereignty', 'air-gapped data', 'self-hosted vs SaaS data'],
      search_intent: 'commercial',
      meta_title: 'Self-Hosted Data Governance: Why 67% of the Market Chose On-Premises',
      meta_description: '67% of data integration revenue comes from on-premises deployments. Learn why self-hosted data governance is growing faster than SaaS and what it means for enterprise strategy.',
      h2_structure: [
        'The Stat Nobody Expected: 67% On-Premises',
        'Why Regulated Industries Cannot Go SaaS',
        'Air-Gapped Deployment: Defence, Government, Critical Infrastructure',
        'Data Sovereignty Regulations Driving the Shift',
        'The Real Cost of Cloud Dependency',
        'Self-Hosted Does Not Mean Backwards',
        'What Self-Hosted Data Governance Looks Like in 2026',
      ],
      key_points: [
        '67% of data integration market revenue from on-prem (Precedence Research 2025)',
        'EU Data Act, China PIPL, national data governance frameworks',
        'Pentagon Chief Data and AI Office initiated data integration experiments April 2025',
        'Air-gapped environments: no internet, no SaaS, still need data governance',
        'Docker containers, customer infrastructure, cryptographic licensing',
        'Integrius: self-hosted, air-gapped, no cloud dependency at runtime',
        'SOC 2/HIPAA: self-hosted means data stays on customer infrastructure',
      ],
      word_count_min: 1200,
      word_count_max: 1500,
      cta_text: 'Deploy data governance on your infrastructure, under your control. See Integrius.',
      internal_links: ['data-integration-challenges-enterprise', 'air-gapped-deployment-explained', 'data-sovereignty-explained'],
    },
    {
      cluster_slug: 'verticals',
      article_type: 'pillar',
      title: 'Data Integration for Pharma: How Architecture Solves ALCOA+ Compliance',
      slug: 'pharma-data-integration-alcoa',
      primary_keyword: 'pharma data integration',
      secondary_keywords: ['ALCOA+ data integrity', 'pharma data governance', 'clinical trial data integration', 'FDA data integrity'],
      search_intent: 'commercial',
      meta_title: 'Pharma Data Integration: Solving ALCOA+ Compliance Through Architecture',
      meta_description: 'FDA warning letters for data integrity are rising. Learn how governed data products make ALCOA+ compliance structural, not manual, for pharmaceutical data integration.',
      h2_structure: [
        'The Rising Cost of Pharma Data Integrity Failures',
        'What ALCOA+ Actually Requires (And Why Current Approaches Fail)',
        'Why Excel and Manual Processes Break the ALCOA+ Chain',
        'Architecture-First Compliance: Governance Built In',
        'Drug Delivery Project Teams: The Use Case',
        'Healthcare and Life Sciences: Fastest Growing Data Vertical',
        'Self-Hosted Deployment for Regulated Environments',
      ],
      key_points: [
        'Healthcare/life sciences: fastest-growing vertical at 18.91% CAGR through 2031 (Mordor Intelligence)',
        'ALCOA+: Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available',
        'Every export-transform-import cycle breaks the ALCOA+ chain',
        'Governed data layer: every transformation logged, every mapping approved, full lineage',
        'Real use case: 10 data sources for a drug delivery project team, unified in minutes',
        'Self-hosted on pharma infrastructure, no data leaves the network',
        'Audit trail on every API call, connection test, and data access',
      ],
      word_count_min: 1500,
      word_count_max: 1800,
      cta_text: 'See how Integrius makes ALCOA+ compliance structural. Built for pharma.',
      internal_links: ['self-hosted-data-governance', 'data-integration-challenges-enterprise'],
    },
    {
      cluster_slug: 'data-integration',
      article_type: 'pillar',
      title: 'The Hidden Cost of Data Integration: What Is Not on Your Vendor Invoice',
      slug: 'data-integration-cost-hidden-tax',
      primary_keyword: 'data integration cost',
      secondary_keywords: ['data integration hidden costs', 'data engineer time maintenance', 'integration maintenance cost'],
      search_intent: 'informational',
      meta_title: 'The Hidden Cost of Data Integration Your Vendor Invoice Does Not Show',
      meta_description: 'Your data integration cost is not what you pay your vendor. It is the 40-80% of engineering time spent maintaining integrations instead of building value.',
      h2_structure: [
        'The Visible Cost vs the Hidden Cost',
        '40-80% of Engineering Time on Maintenance',
        'The Salary Maths: What Integration Maintenance Really Costs',
        'The Opportunity Cost: What Your Engineers Are Not Building',
        'Per-Connector vs Per-Product Pricing: Where Incentives Break',
        'How a Governed Data Layer Reduces the Hidden Tax',
      ],
      key_points: [
        'Data engineers spend 40-80% of time on integration maintenance',
        'Senior data engineer: 120K-180K/yr. 60% on maintenance = 72K-108K per engineer',
        '3 engineers = 216K-324K/yr in hidden integration costs',
        'Opportunity cost: AI initiatives, new data products, innovation capacity',
        'Per-connector pricing (Fivetran), per-call (MuleSoft), per-compute (Snowflake) all penalise growth',
        'Per governed data product pricing aligns cost with value',
        'One change in the governed layer propagates. No downstream cascade',
      ],
      word_count_min: 1200,
      word_count_max: 1500,
      cta_text: 'Stop paying the hidden integration tax. See Integrius pricing.',
      internal_links: ['data-integration-challenges-enterprise', 'data-integration-for-ai'],
    },
    {
      cluster_slug: 'data-products',
      article_type: 'pillar',
      title: 'Data Mesh vs Data Fabric: Which Architecture Is Right for Your Enterprise?',
      slug: 'data-mesh-vs-data-fabric',
      primary_keyword: 'data mesh vs data fabric',
      secondary_keywords: ['data mesh 2026', 'data fabric architecture', 'data mesh data fabric comparison'],
      search_intent: 'informational',
      meta_title: 'Data Mesh vs Data Fabric in 2026: Comparison, Convergence, and What to Build',
      meta_description: 'Data mesh and data fabric are converging. Learn the differences, where each excels, and why the answer for most enterprises is a hybrid governed data layer.',
      h2_structure: [
        'Data Mesh: Decentralised Ownership, Federated Governance',
        'Data Fabric: Metadata-Driven, Automated Integration',
        'Where Data Mesh Struggles',
        'Where Data Fabric Struggles',
        'The Convergence: Why Most Enterprises Need Both',
        'Governed Data Products as the Meeting Point',
        'What Gartner, Thoughtworks, and Alation Say About 2026',
      ],
      key_points: [
        "Thoughtworks Jan 2026: data mesh 'hard-won maturity', not dead",
        'Gartner predicts firms with data fabric will adopt data mesh within 2-3 years (Alation)',
        'Data mesh: domain ownership, data as product, federated governance, self-serve infrastructure',
        'Data fabric: metadata-driven, automated, centralised intelligence layer',
        'The gap: mesh needs governance infrastructure, fabric needs domain ownership',
        'Governed data products bridge both: centralised governance + domain ownership',
        'Integrius implements the hybrid: governed central layer + domain-owned products',
      ],
      word_count_min: 1500,
      word_count_max: 2000,
      cta_text: 'Build the governed layer that bridges mesh and fabric. See Integrius.',
      internal_links: ['what-is-a-data-product', 'data-integration-challenges-enterprise'],
    },
  ];

  // ── FAQ specs ─────────────────────────────────────────────────────────────
  const faqs = [
    { cluster_slug: 'data-integration', search_intent: 'informational', title: 'What Is the N x M Data Integration Problem?', slug: 'n-x-m-data-integration-problem', primary_keyword: 'N x M data integration problem', meta_title: 'What Is the N x M Data Integration Problem?', meta_description: 'The N x M problem means N data sources times M consumers = exponential integrations. A governed data layer reduces this to N + M. Here is how it works.', key_points: ['N sources x M consumers = exponential point-to-point integrations', 'Example: 10 sources x 20 consumers = 200 integrations', 'N + M with a governed layer: 10 + 20 = 30 connections', 'Each governed product serves all consumers through one API', 'Change in source propagates once, not 200 times'] },
    { cluster_slug: 'data-integration', search_intent: 'informational', title: 'What Is a Governed Data Layer?', slug: 'what-is-governed-data-layer', primary_keyword: 'governed data layer', meta_title: 'What Is a Governed Data Layer? The Missing Middle Explained', meta_description: 'A governed data layer sits between raw sources and downstream consumers. Every field mapping is approved, every access decision is logged. Here is what it is and why it matters.', key_points: ['Sits between raw sources and downstream consumers', 'API-served, normalised, schema-validated', 'Every transformation has an approval trail', 'Access is controlled at field level', 'Lineage tracks every change from source to consumer'] },
    { cluster_slug: 'enterprise-search', search_intent: 'informational', title: 'How Much Does Enterprise Search Cost?', slug: 'enterprise-search-cost', primary_keyword: 'enterprise search cost', meta_title: 'How Much Does Enterprise Search Cost in 2026? (Elastic, Coveo, Glean)', meta_description: 'Elastic costs 50K-500K per year. Coveo 100K-1M. Glean 200K+. And that is before engineering time. Here is the full cost breakdown and a cheaper alternative.', key_points: ['Elastic: 50K-500K/yr depending on scale', 'Coveo: 100K-1M/yr, AI-powered but expensive', 'Glean: 200K+/yr, enterprise AI search', 'None include the engineering time to maintain the index', 'Governed search as byproduct: zero additional infrastructure'] },
    { cluster_slug: 'data-products', search_intent: 'informational', title: 'What Is Data Product Governance?', slug: 'data-product-governance', primary_keyword: 'data product governance', meta_title: 'What Is Data Product Governance and Why Does It Matter?', meta_description: 'Data product governance means every field mapping, schema change, and access decision has an approval trail. Without it, a data product is just another unmanaged API.', key_points: ['Approval workflows for schema changes', 'Access control at field level, not just product level', 'Full lineage from source to consumer', 'Audit log on every data access', 'Consumer subscriptions with explicit purpose and scope'] },
    { cluster_slug: 'verticals', search_intent: 'informational', title: 'What Is ALCOA+ in Pharma Data Integrity?', slug: 'alcoa-plus-pharma-data-integrity', primary_keyword: 'ALCOA+ data integrity', meta_title: 'What Is ALCOA+ in Pharma? All 9 Principles Explained', meta_description: 'ALCOA+ is the FDA and EMA standard for pharmaceutical data integrity. It covers 9 principles: Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available.', key_points: ['A: Attributable - who collected the data and when', 'L: Legible - permanent, readable', 'C: Contemporaneous - recorded at time of activity', 'O: Original - first capture, not transcription', 'A: Accurate - no errors or omissions', 'C: Complete - all data including invalidated entries', 'C: Consistent - consistent dates, sequences, identifiers', 'E: Enduring - durable, not erasable', 'A: Available - accessible for review and audit'] },
    { cluster_slug: 'data-integration', search_intent: 'informational', title: 'What Is Blast Radius Analysis in Data Integration?', slug: 'blast-radius-analysis-data', primary_keyword: 'blast radius analysis data', meta_title: 'What Is Blast Radius Analysis in Data? How to Know What Breaks Before You Change It', meta_description: 'Blast radius analysis shows which downstream consumers will break when you change a field mapping. It is dependency graph traversal applied to data integration governance.', key_points: ['Change a field mapping, multiple consumers break', 'Blast radius = all downstream consumers affected by a schema change', 'Dependency graph traversal identifies affected consumers before the change', 'Governed platforms run this automatically on every proposed change', 'Without it, changes are made blind'] },
    { cluster_slug: 'data-integration', search_intent: 'informational', title: 'How to Reduce Data Integration Maintenance Costs', slug: 'reduce-data-integration-maintenance', primary_keyword: 'how to reduce data integration maintenance', meta_title: 'How to Reduce Data Integration Maintenance Costs by 60%+', meta_description: 'Data engineers spend 40-80% of time maintaining integrations. Here is the N+M architecture and the governed data layer approach that eliminates most of that work.', key_points: ['Root cause: point-to-point creates 200 integrations for 10 sources and 20 consumers', 'N+M architecture reduces to 30 connection points', 'One change in the governed layer propagates to all consumers', 'No downstream cascade when a source schema changes', 'Engineers shift from maintenance to building value'] },
    { cluster_slug: 'data-products', search_intent: 'informational', title: 'What Is Per-Data-Product Pricing?', slug: 'per-data-product-pricing-model', primary_keyword: 'per data product pricing', meta_title: 'What Is Per-Data-Product Pricing? Why It Aligns Better Than Per-Connector', meta_description: 'Per-data-product pricing charges for governed outputs, not raw inputs. Unlike per-connector or per-call models, it aligns vendor incentives with customer value delivery.', key_points: ['Per-connector (Fivetran): penalises having more sources', 'Per-call (MuleSoft): penalises growth', 'Per-compute (Snowflake): penalises usage', 'Per-data-product: pay for the governed outputs you publish', 'More data products = more value delivered = aligned pricing'] },
    { cluster_slug: 'self-hosted', search_intent: 'informational', title: 'What Is Self-Hosted Data Governance?', slug: 'self-hosted-data-governance-explained', primary_keyword: 'self-hosted data governance', meta_title: 'What Is Self-Hosted Data Governance? On-Premises, Air-Gapped, Yours', meta_description: 'Self-hosted data governance runs on your infrastructure, inside your network. No data leaves. No SaaS vendor dependency. 67% of the market already deploys this way.', key_points: ['Runs in Docker on your infrastructure', 'No data leaves your network', 'Air-gapped deployment possible with no internet dependency at runtime', 'Cryptographic licensing for offline validation', '67% of data integration market revenue from on-prem (Precedence Research)'] },
    { cluster_slug: 'enterprise-search', search_intent: 'informational', title: 'What Is Federated Search Across Data Products?', slug: 'federated-search-data-products', primary_keyword: 'federated search data products', meta_title: 'What Is Federated Search Across Data Products?', meta_description: 'Federated search queries all governed data products with a single API call. No separate indexing infrastructure. No Elastic. Results are real-time and access-controlled per user.', key_points: ['One API call queries all connected data products', 'Real-time, not a stale index', 'Access-controlled: users only see results they are authorised to see', 'No separate indexing infrastructure', 'Emergent from governance, not an additional product to buy'] },
    { cluster_slug: 'data-products', search_intent: 'informational', title: 'Data Warehouse vs Data Product: What Is the Difference?', slug: 'data-warehouse-vs-data-product', primary_keyword: 'data warehouse vs data product', meta_title: 'Data Warehouse vs Data Product: What Is the Actual Difference?', meta_description: 'A data warehouse stores data for analytical queries. A data product serves governed data through an API with ownership, documentation, and access control. Different jobs. Here is when to use each.', key_points: ['Warehouse: stores for analysis, SQL queries, batch', 'Data product: serves through API, governed, real-time', 'Warehouse has no owner, no SLA, no consumer contract', 'Data product has explicit ownership, schema, consumer subscriptions', 'They are not competitors: warehouses can be sources for data products'] },
    { cluster_slug: 'data-integration', search_intent: 'informational', title: 'What Is Entity Key Joining in Data Integration?', slug: 'entity-key-joining-data', primary_keyword: 'entity key joining data integration', meta_title: 'What Is Entity Key Joining in Data Integration?', meta_description: 'Entity key joining unifies records from multiple data sources using a shared identifier like customer_id or product_sku. It is how disparate systems are turned into a single governed data product.', key_points: ['The entity key is the shared identifier across sources', 'customer_id joins Salesforce + Stripe + Zendesk into one customer record', 'Without a shared key, joining is fuzzy, slow, and error-prone', 'Governed platforms define the entity key at the data product level', 'Every source is mapped to that key, every consumer queries by it'] },
    { cluster_slug: 'data-integration', search_intent: 'informational', title: 'Why Do Data Integration Projects Fail?', slug: 'why-data-integration-projects-fail', primary_keyword: 'why data integration projects fail', meta_title: 'Why Data Integration Projects Fail (And How to Build One That Does Not)', meta_description: 'Data integration projects fail because of scope creep, point-to-point architecture, and no governance layer. Here are the 4 root causes and the architectural fix that addresses them.', key_points: ['Point-to-point does not scale past 5-6 sources', 'No ownership model means no accountability', 'Schema changes break everything downstream', 'Lack of consumer contracts means requirements drift', 'Architecture fix: governed data layer with approval workflows'] },
    { cluster_slug: 'data-products', search_intent: 'informational', title: 'What Is Field-Level Access Control in Data Products?', slug: 'field-level-access-control-data', primary_keyword: 'field level access control data', meta_title: 'What Is Field-Level Access Control in Data Products?', meta_description: 'Field-level access control means each consumer only receives the fields they are explicitly authorised to see. Not all consumers need all fields, and not all fields should be visible to everyone.', key_points: ['Consumer subscriptions specify exactly which fields are in scope', 'API response is filtered to authorised fields only', 'GDPR and HIPAA compliance benefit: minimum necessary data principle', 'Finance consumers see revenue fields, not PII', 'Access control enforced at API layer, not application layer'] },
    { cluster_slug: 'self-hosted', search_intent: 'informational', title: 'What Does Air-Gapped Deployment Mean?', slug: 'air-gapped-deployment-explained', primary_keyword: 'air-gapped deployment', meta_title: 'What Does Air-Gapped Deployment Mean? (And Who Needs It)', meta_description: 'Air-gapped deployment means software runs entirely within a secured environment with no internet connection. Defence, intelligence, critical infrastructure, and regulated industries use it. Here is what it requires.', key_points: ['No internet connection at runtime', 'No callbacks to vendor licensing servers', 'All dependencies bundled at install time', 'Cryptographic offline license validation', 'Used by: defence, intelligence, critical infrastructure, pharma, classified government'] },
  ];

  for (const spec of [...pillars, ...faqs]) {
    const { cluster_slug, ...rest } = spec as typeof spec & { cluster_slug: string };
    await prisma.cms_article_specs.upsert({
      where:  { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        word_count_min: (rest as { word_count_min?: number }).word_count_min ?? 300,
        word_count_max: (rest as { word_count_max?: number }).word_count_max ?? 500,
        cta_text:       (rest as { cta_text?: string }).cta_text,
        internal_links: (rest as { internal_links?: string[] }).internal_links ?? [],
        cluster_id: clusterMap[cluster_slug],
      },
    });
    console.log(`Spec: ${rest.slug}`);
  }

  console.log('\nCMS seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
