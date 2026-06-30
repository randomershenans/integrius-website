---
title: "Stop Throwing Data at the Model: Determinism Over Hope"
slug: stop-throwing-data-at-ai
meta_title: "Determinism Over Hope: Reliable AI on Structured Data"
meta_description: The default AI pattern is throwing data at a model and hoping. Why deterministic processing over structured data, with AI on top, is what works.
excerpt: The industry default is to throw data at a model and hope for a reliable answer. The alternative is older and duller: deterministic processing over structured data, with AI doing only the parts it is genuinely good at.
primary_keyword: reliable ai over structured data
article_type: pillar
cluster_slug: ai-data
published: 2026-06-30
ai_assisted: true
---

## The default pattern, and why it keeps failing

There is a default way people build "AI over our data" in 2026, and it is roughly this: take the data, or the documents, or both, hand them to a large language model, and hope the answer that comes back is right. Wrap it in a chat box. Demo it. Watch the room light up.

Then it meets production. The same question gives two different answers on two different days. A number is confidently wrong. Someone who should not see a salary figure sees one. Nobody can explain where a total came from. The pilot that dazzled in the boardroom quietly stops being used, and the project joins the large and growing pile of AI initiatives that demoed beautifully and delivered nothing dependable.

The instinct is to blame the model, or the prompt, and reach for a bigger one. That is almost never the problem. The problem is architectural: the model has been asked to be four things at once. Retriever, calculator, system of record, and explainer. It is genuinely good at one of those and unreliable at the other three.

## Determinism is a feature, not a limitation

Here is the unfashionable idea at the centre of this. For most of the questions a business actually needs answered, you want a deterministic system: same input, same output, every time, exactly, with a record of how it got there.

Deterministic processing is the boring machinery that has run serious systems for decades. A query engine that aggregates the same rows the same way. Validation rules that either pass or fail. Access control that returns a field or refuses it. None of it is exciting, and all of it is trustworthy. It is exact, it is reproducible, and it leaves a trail. In any setting where a wrong answer costs money or fails an audit, those properties are not a nice-to-have. They are the whole job.

A probabilistic model is, by design, the opposite. It produces a plausible answer, not a guaranteed one, and it will happily produce a slightly different plausible answer next time. That is a strength when the task is open-ended language. It is a disqualifier when the task is the number on a report.

## What AI is actually good at, and what it is not

Be fair to the model. It is genuinely excellent at the things that used to be impossible to automate.

It understands messy human intent. It turns a vague question into a precise one. It reads and writes language fluently. It explains a result in plain English and picks a sensible way to visualise it. That fuzzy, linguistic front-end is real, valuable, and hard, and it is exactly where AI earns its place.

It is unreliable at exact arithmetic over large inputs. It is not a system of record. It does not give you the same answer twice by default. It does not enforce who is allowed to see what, and it does not leave an audit trail. Asking it to do those jobs is not using AI; it is hoping.

## Give each part of the job to the right component

The fix is not less AI. It is decomposition: give each part of the job to the component that is actually good at it.

The model translates a natural-language question into a validated, governed instruction, and narrates the result at the end. In between, a deterministic data layer does the work: it filters, joins and aggregates the real records exactly, inside access control and governance, and writes a tamper-evident record of the read. The model never has to reason over a giant pile of raw data and never has to do the maths. It only ever sees a small, already-correct result, and its job is to put that result into words.

Run it this way and the properties invert. The answer is computed, not guessed. It is the same every time. It carries its lineage. Every read is on the record. And it holds up whether the dataset has a thousand rows or ten million. The specific case of retrieval and RAG, where this same mistake shows up most often, is worked through in [RAG can't count](/blog/rag-cant-count).

## Why "throw it at the model" is so seductive

It is worth being honest about why the wrong pattern is so popular. It demos brilliantly. One prompt, one box, an answer that looks like magic, and almost no engineering to get there. Compared to the unglamorous work of [turning fragmented sources into governed data products](/blog/what-is-a-data-product), throwing everything at a model feels like a shortcut to the future.

It is a shortcut that skips the parts that make an answer trustworthy. No determinism, no governance, no lineage, no audit, and steady degradation as the data grows. For a brainstorm or a first draft, none of that matters. For anything a business has to stand behind, all of it does. This is the same lesson, in a new costume, that [AI projects keep learning the hard way](/blog/data-integration-for-ai): the model was never the bottleneck, the state of the data underneath it was.

## This is not anti-AI. It is AI you can trust.

The argument here is not that AI is overblown, or that you should use less of it. It is that AI belongs in a specific place: on top, doing intent and language, with deterministic computation over governed, structured data underneath. Put it there and you get the best of both, answers that are fluent and exact, conversational and provable.

In regulated industries the test is brutally simple. Would you sign your name to the number? Under [21 CFR Part 11 and ALCOA+](/blog/pharma-data-integration-alcoa), sometimes you literally have to. "The model said so" is not an answer an inspector accepts, and it should not be one you accept either.

Deterministic by default, with AI for the parts only AI can do, is how you get to a number you can sign. That is the whole thesis, and it is why we built Integrius the way round we did: governed, structured data first, and the model on top of it, never the other way around.
