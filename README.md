# AI Field Guide

**Live site: https://eesterlein.github.io/ai-field-guide/**

An interactive guide to the AI words programmers keep hearing (*agent*, *harness*, *context window*, *MCP*, *RAG* and more), explained with demos you can play with instead of walls of text.

Many cards also have **Why it matters**, **Where it came from** and **How humans do it** notes that connect each idea to how people think.

Every term has two explanations, and a toggle at the top switches between them:

- **Plain English**: an everyday analogy, written for anyone.
- **Developer**: the technical version, with a short code example.

## What's inside

The guide is split into tabs that build on each other. Work through them in order or jump around; search covers every tab.

| Tab | What's in it |
|---|---|
| Start here | A clickable map of how the pieces fit together, and a suggested path |
| 01 History & math | A timeline from Turing (1950) to agents (2025), the Turing test, words as vectors, attention, the five formulas behind it all, and why nobody fully understands what's inside a model |
| 02 How models work | LLM, token, context window, context confusion (context rot), temperature, embedding, hallucination |
| 03 Prompting | prompt engineering, system prompt, few-shot prompting, reasoning, structured output |
| 04 Tools & skills | tools vs skills vs the agent loop, tool use, MCP, RAG, vector database, skills |
| 05 Agents | agent, harness, subagents, agentic AI, memory, compaction, context engineering |
| 06 Shipping it | prompt caching, fine-tuning vs prompting, evals, guardrails, latency & cost |
| 07 Good & bad habits | 10 common mistakes, what goes wrong, and what to do instead |
| 08 Quiz | 13 questions |

## Live demos

- **Prompt playground**: type any prompt (typos welcome) and a toy model scores it on goal, context, audience, format, constraints and examples, then answers with something silly that gets better as your prompt does
- **Tool, skill, or neither?**: a 9-question guessing game
- **Human or machine?**: a Turing test game, starting with two exchanges from Turing's 1950 paper
- **Words as vectors**: king − man + woman, step by step
- **Attention**: change one word and watch what "it" refers to
- **A model's weights**: a peek at the numbers inside a model, and what a "feature" is
- **Tokens**: type a sentence and watch it split into tokens
- **Temperature**: a slider that reshapes the odds for the model's next word, with a live table of the softmax math
- **Embeddings**: a meaning map; click a word to see its nearest neighbors and the cosine-similarity math behind them
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

## Running it locally

Plain HTML, CSS and JavaScript with no build step and no dependencies apart from Google Fonts.

```bash
git clone https://github.com/Eesterlein/ai-field-guide.git
cd ai-field-guide
python3 -m http.server 8000   # then open http://localhost:8000
```

## How it's organized

| File | What it holds |
|---|---|
| `index.html` | Page shell, header, tabs and the overview map |
| `style.css` | All styles, with light and dark themes |
| `js/content.js` | Every term, habit, quiz question, timeline entry and formula |
| `js/demos.js` | The interactive demos |
| `js/app.js` | Tabs, search, the Plain English / Developer toggle and the quiz |

To add a term, add an entry to `TERMS` in `js/content.js`. Give it a `viz` name and a matching function in `js/demos.js` if it needs a demo.

It works on phones, follows the system's light or dark mode, and respects the reduced-motion setting.

## A note on accuracy

The demos are simplified pictures of how these systems behave, not real model internals. The tokenizer and the prompt playground's scoring are approximations, and the timings, similarity scores, attention weights and context-confusion curve are illustrative. The context-confusion curve's shape follows *Lost in the Middle* (Liu et al., 2023) and Chroma's *Context Rot* study (2025).
