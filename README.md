# @pipeworx/pangaea

[PANGAEA](https://www.pangaea.de/) MCP — earth + environmental science data publisher (DOIs, datasets, metadata). Keyless Elasticsearch metadata endpoint.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(q?, size?, from?)` — full-text dataset search
- `dataset(id)` — single dataset metadata by PANGAEA ID (numeric)
- `dataset_by_doi(doi)` — dataset by DOI (e.g. `10.1594/PANGAEA.999999`)
- `recent(size?, days?)` — recently published datasets
- `facets(field, q?, size?)` — facet aggregation on a field (`author`, `parameter`, `project`, etc.)

## Data source

`https://ws.pangaea.de/es/pangaea/panmd`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "pangaea": {
      "url": "https://gateway.pipeworx.io/pangaea/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Pangaea data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
