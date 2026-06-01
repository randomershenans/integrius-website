---
title: What Is the N x M Data Integration Problem?
slug: n-x-m-data-integration-problem
meta_title: What Is the N x M Data Integration Problem?
meta_description: The N x M problem means N data sources times M consumers equals exponential integrations. A governed data layer reduces this to N + M. Here is how it works.
excerpt: The N x M problem is what happens when every data source is wired directly to every consumer. A governed data layer collapses that web into a simple N plus M.
primary_keyword: N x M data integration problem
article_type: faq
cluster_slug: data-integration
---

## What is the N x M data integration problem?

The N x M data integration problem describes what happens when you connect data sources directly to the systems that use them. N is your number of data sources. M is your number of consumers, such as dashboards, reports, applications, and models.

When every source is wired straight to every consumer, the number of connections is N times M. This grows fast. A handful of sources and a handful of consumers can produce dozens of separate integrations.

Each integration is a piece of code that someone has to build, test, and maintain. The work does not scale in a straight line. It scales with multiplication.

## Why does point-to-point integration grow so fast?

Point-to-point integration means each consumer reaches into each source on its own terms. There is no shared layer in between. Every connection is bespoke.

The trouble is multiplication. Add one new source, and you may need to wire it to every existing consumer. Add one new consumer, and it may need a feed from every existing source.

So the count is not additive. It is N times M. Ten sources and ten consumers is up to one hundred integrations. Double both and you are near four hundred. The web of connections grows faster than the business behind it.

This is why teams that start small still end up overwhelmed. The integrations are invisible until something breaks, and then every one of them is a place where it can break.

## What does the N x M problem cost a data team?

The cost shows up as maintenance, not just the initial build. Every point-to-point integration is a standing liability.

Consider a worked example. You have 10 sources and 20 consumers.

| Approach | Connections |
| --- | --- |
| Point-to-point (N times M) | up to 200 |
| Governed layer (N plus M) | 30 |

With the point-to-point approach, that is up to 200 separate integrations to keep alive. When one source changes its schema, renames a field, or shifts its format, you may have to update every integration that touches it.

The result is brittle. Engineers spend their time repairing connections instead of building new value. Trust in the data falls, because no one is sure which feed is current. For more on this, see [The Hidden Cost of Data Integration](/blog/data-integration-cost-hidden-tax).

## How does a governed data layer reduce N x M to N + M?

A governed data layer sits in the middle. Each source connects to the layer once. Each consumer connects to the layer once. The multiplication disappears.

The maths changes from N times M to N plus M. In the worked example, 10 plus 20 is 30 connection points instead of up to 200. The web becomes a hub.

The key is the unit in the middle: a governed data product. Each data product has a clear owner, a normalised schema, documentation, lineage, and field-level access control. It serves all of its consumers through one stable API. This is the idea behind [What Is a Data Product?](/blog/what-is-a-data-product).

The payoff comes when a source changes. With point-to-point wiring, that change can ripple across many integrations. With a governed data product, you update the one product behind the API. The change propagates once, and every consumer keeps reading the same stable interface. [Integrius](/contact) builds exactly this layer: it turns scattered sources into governed data products, each with an owner, an API, and access control, deployed inside your own infrastructure through Docker or Helm.

## Does this mean I should stop integrating systems directly?

No. A direct connection is fine when it is genuinely a one to one link that no one else needs. Not every flow has to pass through a shared layer.

The N x M problem appears when the same source feeds many consumers, or the same consumer pulls from many sources. That is where shared, governed data products earn their place. A single source feeding a single tool, used by one team, may not need the extra structure.

The judgement is about reuse. If data is shared widely, govern it once. If it is truly private to one path, a direct link can be the simpler choice. The goal is fewer, clearer connections, not a layer for its own sake.

## How do I know if I have an N x M problem?

Look for the signs in how your team spends its time and how data moves.

- A schema change in one source forces edits in several downstream places.
- Nobody can say with confidence how many integrations exist.
- The same data is pulled and reshaped in several different pipelines.
- New requests sit in a queue because each one means new bespoke wiring.
- Two teams quote different numbers for the same metric.

If two or three of these feel familiar, you likely have point-to-point sprawl. The number of consumers is the multiplier to watch. As soon as several systems depend on the same data, governing it as a product pays off. The same pattern is what stalls many AI projects, as covered in [Why Your AI Initiative Is Failing: It Is the Data](/blog/data-integration-for-ai).

Could your team name every integration it runs today? If not, the N times M web may already be costing you more than you think. To see how a governed layer would reshape your specific sources and consumers, [talk to us about your setup](/contact).
