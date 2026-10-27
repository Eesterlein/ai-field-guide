# AI Field Guide

**Live site: https://eesterlein.github.io/ai-field-guide/**

An interactive guide to the AI words programmers keep hearing (*agent*, *harness*, *context window*, *MCP*, *RAG* and more), explained with demos you can play with instead of walls of text.

Every term has two explanations, and a toggle at the top switches between them:

- **Plain English**: an everyday analogy, written for anyone.
- **Developer**: the technical version, with a short code example.

## What's inside

| Section | Terms |
|---|---|
| 01 How models work | LLM, token, context window, context confusion (context rot), temperature, embedding, hallucination |
| 02 Talking to models | prompt, system prompt, few-shot prompting, reasoning, structured output |
| 03 Giving models abilities | tool use, MCP, RAG, vector database |
| 04 Agents | agent, harness, subagents, agentic AI, skills, memory, compaction, context engineering |
| 05 Shipping it | prompt caching, fine-tuning vs prompting, evals, guardrails, latency & cost |
| 06 Good habits, bad habits | 9 common mistakes, what goes wrong, and what to do instead |
| 07 Check yourself | a 9-question quiz |

## Live demos

- **Tokens**: type a sentence and watch it split into tokens
- **Temperature**: a slider that reshapes the odds for the model's next word
- **Embeddings**: a meaning map; click a word to see its nearest neighbors
- **Context window**: a bucket that overflows, then drops or compacts old messages, with a focus meter that drops as it fills
- **Context confusion**: a lost-in-the-middle curve showing how often the model follows an instruction depending on where it sits and how full the window is
- **Agent loop**: an agent thinks, acts and observes its way to fixing a failing test
- **Harness**: remove the harness and see what the bare model can still do
- **Tool use**: a step-by-step diagram of a weather lookup for Gunnison, CO
- **MCP**: plug servers in and out and watch the available tools change
- **RAG**: a six-step "look it up, then answer" pipeline
- **Subagents**: helpers work in parallel while the main agent's context stays clean
- **Prompt caching**: a cache miss and a cache hit, side by side
- **Fine-tuning vs prompting**: a yes/no decision helper
- **Spot the hallucination**: find the three made-up claims hidden in an AI answer

The overview map at the top is clickable, and there's a search box for jumping straight to a term.

## Running it locally

It's a single HTML file with no build step and no dependencies apart from Google Fonts.

```bash
git clone https://github.com/Eesterlein/ai-field-guide.git
cd ai-field-guide
open index.html          # or: python3 -m http.server 8000
```

## Built with

Plain HTML, CSS and JavaScript, with inline SVG for the diagrams. No frameworks. It works on phones, follows the system's light or dark mode, and respects the reduced-motion setting.

## A note on accuracy

The demos are simplified pictures of how these systems behave, not real model internals. The tokenizer is an approximation, and the timings, similarity scores and context-confusion curve are illustrative. The curve's shape follows *Lost in the Middle* (Liu et al., 2023) and Chroma's *Context Rot* study (2025).
