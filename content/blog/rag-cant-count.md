---
title: "RAG Can't Count: Why Retrieval Fails on Regulated Data"
slug: rag-cant-count
meta_title: "RAG Can't Count: Why It Fails on Regulated Data"
meta_description: RAG retrieves text, it does not compute. Here is why retrieval-augmented generation fails on governed, regulated data, and what replaces it.
excerpt: RAG is brilliant at finding text and useless for the numbers a regulated business has to defend. Here is the line, and what works on the other side of it.
primary_keyword: rag for structured data
article_type: pillar
cluster_slug: ai-data
published: 2026-06-30
ai_assisted: true
---

## Every AI-over-your-data demo looks the same

Someone asks a question in plain English, a confident paragraph comes back, the room nods. Then you put it in front of a quality lead in a regulated environment and the first question is the one that matters: can you prove that number is right, show me which records produced it, and get the same answer tomorrow?

That is where most of these systems go quiet.

Almost all of them are built on RAG, retrieval-augmented generation. RAG finds chunks of text that look relevant to your question, usually by embedding similarity, stuffs them into the model's prompt, and lets the model write an answer. For the job it was designed for, this is genuinely excellent. The trouble starts when people point it at the questions that actually run a business.

## RAG is the right tool for the wrong half of the problem

Searching ten thousand papers, SOPs, contracts, or regulatory filings for the passage that matters. Summarising unstructured text. Open-ended document question answering. RAG and knowledge graphs over scientific and regulatory text are the right tool for that, and the teams building that layer are doing valuable work.

But most of the questions a business needs answered are not text-retrieval questions. How many serious adverse events by site last quarter? What is enrolment by region against plan? Which lots are affected if this parameter changes? Those are computations over structured, governed, operational data. And RAG cannot compute.

## RAG cannot compute

Ask RAG for a quarterly total and it retrieves text that mentions the thing you asked about. It does not aggregate the records. The number it hands back is generated, not calculated. Sometimes it is right. In regulated work, "sometimes right" is the same as wrong.

This is not a prompt problem, and a bigger model does not fix it. The architecture is asking a language model to behave like a database, and a [data product](/blog/what-is-a-data-product) is precisely the thing it is not.

It gets worse the closer you look. Four properties that a regulated buyer treats as non-negotiable are exactly the four RAG cannot offer:

- **Reproducibility.** Ask the same question twice and retrieval plus generation can hand you two different answers. An auditor expects the same number every time.
- **Governance.** A vector store flattens your access control. The retrieved chunk does not know that this user is not allowed to see patient identifiers. Proving who could see what becomes guesswork.
- **Lineage and audit.** RAG cannot show you which source records produced a figure, and it leaves no tamper-evident record of the read. That is precisely the evidence [ALCOA+ and 21 CFR Part 11](/blog/pharma-data-integration-alcoa) exist to demand.
- **Behaviour at scale.** Stale indexes, missed retrievals, and re-embedding cost. The bigger and more important your data gets, the less you can trust the guess.

None of this is a knock on retrieval. It is a knock on using retrieval for a job it was never built to do.

## Stop asking the model to be the database

The fix is to give the model only the two things it is genuinely good at, and let a governed data layer do the rest.

The model translates a natural-language question into a validated, governed query, and it narrates the result in plain language. It never does the arithmetic. The data layer does that, exactly, inside role-based access control, governance, and a hash-chained audit trail, on the customer's own infrastructure with nothing leaving the network. The model only ever sees a small, already-correct result, never a truncated sample of a large dataset it has to reason over.

So the answer is computed, not retrieved. It is the same every time. It carries its lineage. Every read is on the record. And it stays correct whether the product holds a thousand rows or ten million. This is the difference between AI bolted onto a pile of documents and AI built on [governed data products](/blog/data-product-governance), and it is why [data readiness, not model choice, decides whether an AI project survives contact with production](/blog/data-integration-for-ai).

| | RAG over documents | Governed query |
|---|---|---|
| Produces the number by | Retrieving text, then generating | Computing in the data layer |
| Same question, same answer? | Not guaranteed | Always |
| Respects field-level access control | No | Yes |
| Shows lineage (which records) | No | Yes |
| Tamper-evident audit of the read | No | Yes, hash-chained |
| Holds up as data grows | Degrades | Holds |
| Where the data and model live | Often the cloud | Fully on-prem, no egress |

## Two different jobs

This is not RAG versus everything else. It is two different jobs.

Finding the right paragraph in a mountain of unstructured science is one job, and a real one. Giving a regulated business an exact, governed, provable answer to an operational question is another. Use each for what it is good at. The expensive mistake is reaching for the document tool to answer the operational question, then discovering at audit time that "probably right" was never going to be good enough.

It is the same lesson that has haunted [enterprise search for a decade](/blog/why-enterprise-search-sucks): a clever layer on top cannot rescue an ungoverned layer underneath.

## The bar in regulated industries

In regulated industries the number has to be exact, governed, and provable, and the whole thing has to be able to run [on infrastructure you control](/blog/self-hosted-data-governance). That is the bar. RAG was not built to clear it, and no amount of retrieval tuning gets it there.

So we did not start with the model. We started with the governed data, and let the model do only what it is good at on top of it.
