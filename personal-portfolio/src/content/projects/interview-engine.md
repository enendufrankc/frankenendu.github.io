---
title: "Interview Engine"
summary: "I built an AI-assisted research platform that turns documents into editable interview plans, supports text and realtime voice conversations, and links findings to participant evidence."
category: "ballys"
stage: "Active development"
role: "AI Engineer R&D · Bally’s Interactive"
tech: ["React", "Node.js", "Express", "Claude", "Gemini Realtime", "AWS"]
order: 3
detail: true
diagram: "interview"
---

## Problem

Research interviews involve several connected tasks: turning a brief into questions, guiding a conversation, retaining the right material and producing findings that can be traced back to what participants said. An AI-assisted workflow needs to preserve those connections throughout the process.

At Bally's Interactive, I built an interview platform around that sequence. The goal is to support the researcher's preparation and analysis while giving conversations a clear structure and keeping evidence attached to the resulting findings.

## My contribution

I developed a React and Express application that extracts source documents, creates editable interview plans and supports text and voice conversations. The implementation integrates Claude and Gemini, with direct Gemini realtime voice in the current conversation path.

My work includes turn planning, provider adapters, consent collection, access controls, recording and retention handling. I also built the synthesis workflow, automated tests and deployment pipeline configuration. These parts connect the visible interview experience to the handling of its underlying artifacts.

## Engineering decisions

I separated planning, conversation control and synthesis so each stage has a defined responsibility. Document extraction has resource bounds, and voice supervision handles reconnects with bounded retries and backoff. These controls address practical failure modes around a conversation that needs to remain understandable to its user.

For analysis, findings carry source quotations. The synthesis process checks cited text, and a separate evidence-review step can return an insufficient-evidence result. That makes uncertainty an available outcome when the material does not support a proposed finding.

Access and retention controls are part of the application workflow. Viewing an interview and managing its collaborators have distinct permissions, while retention handling provides a mechanism for expiring stored artifacts.

## Outcome

The platform brings document-based planning, text and realtime voice interviewing, and evidence-linked analysis into one implementation. Development continues around delivery and hardening, with engineering attention on conversation reliability and the traceability of the findings it produces.
