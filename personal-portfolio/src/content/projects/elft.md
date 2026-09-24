---
title: "ELFT"
summary: "I built a natural-language assistant that connects staff questions to relevant Power BI reports and data assets. The solution was subsequently productionised."
category: "client"
stage: "Productionised"
role: "AI engineer · Embedded client delivery through BCN"
tech: ["Python", "Streamlit", "Azure OpenAI", "Azure AI Search"]
order: 1
detail: true
diagram: "report"
---

## Problem

A reporting environment is only useful when people can find the right information. At ELFT, staff needed to discover relevant Power BI reports and data assets without knowing their exact titles. The starting point was a question about their work, while the available information was organised around reports, descriptions and links.

I worked on this engagement through BCN, embedded with the client to turn that discovery problem into a practical application. The task was to help people locate existing reporting resources and understand which ones might answer their question.

## My contribution

I built a Python application with a Streamlit conversation interface. It takes a staff member's question, extracts a useful search phrase, retrieves matching assets from Azure AI Search and uses Azure OpenAI to present the results in natural language.

The answer brings together report names, descriptions and clickable links. That gives the conversation a clear destination: a relevant reporting resource that the user can open and explore. Conversation history keeps the interaction visible as staff work through their questions.

## Engineering decisions

I separated query interpretation, retrieval and answer generation into distinct components. This makes each stage's responsibility clear: interpret what the user needs, find candidate resources, then explain the retrieved results.

The generation prompt directs the model to work from the retrieved report information. The application uses text search over the indexed assets, with a limited set of results passed into the answer stage. This keeps the implementation focused on the report-discovery workflow and the information available in its catalogue.

## Outcome

Client staff used the solution during the engagement, and it was subsequently productionised. My contribution was the discovery application: connecting a natural-language interface to the client's existing reporting assets and making those assets easier to navigate.
