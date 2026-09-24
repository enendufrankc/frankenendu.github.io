---
title: "Financial-planning letter assistant"
summary: "I built a document-to-letter assistant that combines meeting material and planner context into structured financial-planning review letters, with an editable Word export for staff."
category: "client"
stage: "Staff-used prototype"
role: "AI engineer · Embedded client delivery through BCN"
tech: ["Python", "FastAPI", "React", "TypeScript", "Azure OpenAI", "Docling", "Pydantic"]
order: 2
detail: true
diagram: "letter"
---

## Problem

Preparing a financial-planning review letter involves bringing several sources together: meeting notes, agendas, earlier correspondence, valuations and the planner's own context. Each source contributes something different, while the final letter needs a consistent structure that staff can review and edit.

Working through BCN, I built a prototype around that document workflow. The central challenge was to connect the source material, the letter's individual sections and the final Word document in an interface that client staff could use.

## My contribution

I developed a React and TypeScript frontend connected to a Python FastAPI backend. Staff can supply Word and PDF documents, start a generation job and follow its progress through the interface. The backend converts the documents into Markdown, uses the resulting text to generate the letter's sections and assembles them into a downloadable Word document.

I implemented the processing path from document intake to export, including the background job and status-polling workflow. The result fits into a familiar editing process: staff receive a draft they can open, revise and review in Word.

## Engineering decisions

I separated document conversion, section generation and document rendering. Different document formats first pass through Docling, giving the generation stage a common text representation.

I used section-specific prompts and Pydantic-derived schemas to describe the expected structure, with JSON output assembled before the final export. Generating sections separately makes the letter's requirements explicit and gives each part a defined purpose. Background processing lets the interface communicate progress while the document work runs.

The output remains an editable draft within the planner's review process. Structure helps organise the generated material; professional review remains part of preparing the final letter.

## Outcome

Client staff used the prototype during the engagement. It demonstrated a complete document-to-letter workflow, from mixed source documents through structured generation to a Word file ready for review.
