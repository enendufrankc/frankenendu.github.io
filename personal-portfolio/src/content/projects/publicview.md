---
title: "PublicView"
summary: "I built an NHS benchmarking prototype combining performance comparisons, natural-language data exploration and downloadable narrative reports, with feedback capture to support iteration with client staff."
category: "client"
stage: "Staff-used prototype"
role: "AI engineer · Embedded client delivery through BCN"
tech: ["Python", "Streamlit", "pandas", "LangChain", "Azure OpenAI", "Azure Blob Storage", "ReportLab"]
order: 3
detail: true
diagram: "chart"
---

## Problem

Performance data can support a useful conversation when people can move between the headline numbers and the questions behind them. For NHS benchmarking, that means understanding an organisation's position, comparing national and peer metrics, and explaining patterns in a form colleagues can discuss.

Through BCN, I worked on a prototype that brought those activities into one application. The challenge was to connect data exploration with reporting while keeping the underlying metrics available to the person doing the analysis.

## My contribution

I built a multi-page Streamlit application with performance views, recommended metrics, natural-language data chat, trend views and downloadable PDF reports. Python and pandas prepare the data; charting and generated narrative provide different ways to inspect and explain it.

The data-chat workflow loads data from Azure Blob Storage into a dataframe and uses a LangChain agent to support questions about it. I also built the reporting path, turning analysis into a formatted PDF with ReportLab, and added feedback capture to support iteration with staff.

## Engineering decisions

I organised the application around distinct analysis tasks. A recommended-metrics view helps users find a starting point, while the data-chat view supports follow-up questions. Charts, comparisons and narrative sit alongside one another so the workflow can accommodate both a specific query and broader exploration.

The narrative generation uses performance fields, including national and peer comparisons, as context. The reporting layer turns that analysis into a shareable document. Keeping data preparation, model interaction and PDF formatting separate gives each stage a clear responsibility and makes the workflow easier to revise.

## Outcome

Client staff used the prototype to explore organisational and peer benchmarks. The delivered application connected the steps from selecting a metric to asking questions and producing a report. It also created a practical feedback loop for refining the experience, with generated analysis remaining subject to staff review.
