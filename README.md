# Music Nerd Docs

Documentation for the [Music Nerd API](https://github.com/xdjs/MusicNerdAPI): guides, an OpenAPI-driven reference with an in-page **Try it** playground, and AI-readable copies (`/llms.txt`, `/llms-full.txt`, Markdown for every page).

```bash
pnpm install
pnpm dev
```

See [`AGENTS.md`](AGENTS.md) for layout, conventions and how to add an endpoint.

## Artist knowledge contract and design history

The [artist knowledge guide](content/source/artist-knowledge.mdx) and [OpenAPI reference](content/source/api-reference/openapi/knowledge.json) document the implementation preview; these endpoints are not released. The earlier design records remain available:

- [Shared artist knowledge tools](proposals/artist-knowledge-tools.md) and [draft OpenAPI](proposals/artist-knowledge.openapi.json) — MusicNerdWeb#1424.
- [Agent requirements: implemented, planned and missing](proposals/agent-requirements-assessment.md) — MusicNerdWeb#1424 and #1422.
