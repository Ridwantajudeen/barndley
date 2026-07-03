import server from '../src/server';

function nodeHeadersToWebHeaders(nodeHeaders: Record<string, string | string[] | undefined>) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.append(name, value);
    }
  }
  return headers;
}

function readBody(req: import('http').IncomingMessage): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk as Uint8Array));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: import('http').IncomingMessage, res: import('http').ServerResponse) {
  const rawUrl = req.url ?? '/';
  const host = req.headers.host ?? 'localhost';
  const url = new URL(rawUrl, `https://${host}`);
  const headers = nodeHeadersToWebHeaders(req.headers as Record<string, string | string[] | undefined>);
  const bodyBuffer = await readBody(req);
  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: bodyBuffer.length
      ? bodyBuffer.buffer.slice(bodyBuffer.byteOffset, bodyBuffer.byteOffset + bodyBuffer.byteLength)
      : undefined,
  });

  const response = await server.fetch(request, process.env, undefined);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const arrayBuffer = await response.arrayBuffer();
  res.end(Buffer.from(arrayBuffer));
}
