-- The blog moved to git-native markdown in content/blog/ (published by merging
-- a PR; the SEO brain opens those PRs). The database-backed CMS content tables
-- are dead weight: drop them. cms_admin_users stays, it backs admin login.
--
-- Drop order respects foreign keys: cms_articles references cms_article_specs
-- and cms_keyword_clusters; cms_article_specs references cms_keyword_clusters.

DROP TABLE IF EXISTS "cms_generation_queue";
DROP TABLE IF EXISTS "cms_articles";
DROP TABLE IF EXISTS "cms_article_specs";
DROP TABLE IF EXISTS "cms_keyword_clusters";
