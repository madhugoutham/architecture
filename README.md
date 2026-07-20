# llm-d Visual Architecture Guide

An animated, step-by-step visual guide to the **llm-d Endpoint Picker (EPP)** and the
Gateway API Inference Extension — built as a study companion for ten deep-dive questions:

1. The EPP request pipeline (filter → score → pick)
2. Metrics: collected vs. scored
3. Does EPP run a tokenizer?
4. Prefix-to-pod state & restarts
5. Prefill/decode disaggregation
6. Metrics collection at scale (~100 model servers)
7. vLLM vs. SGLang agnosticism
8. KV-cache eviction events
9. CPU offloading & LMCache
10. Filesystem & object-store tiers

## Features

- Every architecture diagram is an **animated, step-through SVG** with play/pause controls
  and per-step captions — watch the request flow instead of decoding ASCII art.
- Plain-English explanations with real-world analogies, misconception callouts,
  comparison tables, and key takeaways per topic.
- Facts verified against pinned revisions of
  [llm-d/llm-d-router](https://github.com/llm-d/llm-d-router),
  [gateway-api-inference-extension](https://github.com/kubernetes-sigs/gateway-api-inference-extension),
  and [vllm-project/vllm](https://github.com/vllm-project/vllm) — sources linked at the
  bottom of each page.
- Fully static (HTML/CSS/JS, no build step) — works on any phone.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployed

Served with GitHub Pages from the `main` branch.
