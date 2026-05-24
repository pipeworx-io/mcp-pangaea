interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * PANGAEA MCP — earth + environmental science data publisher.
 */


const BASE = 'https://ws.pangaea.de/es/pangaea/panmd';
const UA = 'pipeworx-mcp-pangaea/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Full-text dataset search.',
    inputSchema: { type: 'object', properties: { q: { type: 'string' }, size: { type: 'number' }, from: { type: 'number' } } },
  },
  { name: 'dataset', description: 'Single dataset metadata by PANGAEA ID.', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  { name: 'dataset_by_doi', description: 'Dataset by DOI.', inputSchema: { type: 'object', properties: { doi: { type: 'string' } }, required: ['doi'] } },
  { name: 'recent', description: 'Recently published datasets.', inputSchema: { type: 'object', properties: { size: { type: 'number' }, days: { type: 'number' } } } },
  {
    name: 'facets',
    description: 'Facet aggregation on a field.',
    inputSchema: { type: 'object', properties: { field: { type: 'string' }, q: { type: 'string' }, size: { type: 'number' } }, required: ['field'] },
  },
];

async function post(body: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}/_search`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PANGAEA: ${res.status}`);
  return res.json();
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  const reqNum = (k: string, ex: string) => {
    const v = args[k];
    if (v == null || typeof v !== 'number') throw new Error(`Required argument "${k}" is missing. Pass a number like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'search': {
      const size = Number(args.size ?? 25);
      const from = Number(args.from ?? 0);
      const query = args.q ? { multi_match: { query: String(args.q), fields: ['title', 'abstract', 'author', 'parameter'] } } : { match_all: {} };
      return post({ size, from, query });
    }
    case 'dataset':
      return post({ size: 1, query: { term: { 'internal.id': reqNum('id', '999999') } } });
    case 'dataset_by_doi':
      return post({ size: 1, query: { term: { 'citation.doi.keyword': reqStr('doi', '"10.1594/PANGAEA.999999"') } } });
    case 'recent': {
      const size = Number(args.size ?? 25);
      const days = Number(args.days ?? 7);
      const ms = days * 86400 * 1000;
      const since = new Date(Date.now() - ms).toISOString();
      return post({
        size,
        sort: [{ 'citation.year': 'desc' }],
        query: { range: { 'citation.date': { gte: since } } },
      });
    }
    case 'facets': {
      const field = reqStr('field', '"author"');
      const size = Number(args.size ?? 25);
      const query = args.q ? { multi_match: { query: String(args.q), fields: ['title', 'abstract'] } } : { match_all: {} };
      return post({ size: 0, query, aggs: { facet: { terms: { field, size } } } });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
