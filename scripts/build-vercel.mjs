import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const clientDir = path.join(distDir, 'client');
const serverDir = path.join(distDir, 'server');
const outputDir = path.join(root, '.vercel', 'output');
const staticDir = path.join(outputDir, 'static');
const functionDir = path.join(outputDir, 'functions', 'index.func');

execFileSync('npm', ['run', 'build'], {
  cwd: root,
  env: { ...process.env, WAYLOG_SKIP_VERCEL_ADAPTER: '1' },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

await rm(outputDir, { recursive: true, force: true });
await mkdir(staticDir, { recursive: true });
await mkdir(functionDir, { recursive: true });

await cp(clientDir, staticDir, { recursive: true });
await cp(serverDir, path.join(functionDir, 'server'), { recursive: true });
await cp(clientDir, path.join(functionDir, 'static'), { recursive: true });

await writeFile(
  path.join(outputDir, 'config.json'),
  `${JSON.stringify(
    {
      version: 3,
      routes: [{ handle: 'filesystem' }, { src: '/(.*)', dest: '/index' }],
    },
    null,
    2,
  )}\n`,
);

await writeFile(
  path.join(functionDir, '.vc-config.json'),
  `${JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.mjs',
      launcherType: 'Nodejs',
      supportsResponseStreaming: true,
    },
    null,
    2,
  )}\n`,
);

await writeFile(
  path.join(functionDir, 'package.json'),
  `${JSON.stringify({ type: 'module' }, null, 2)}\n`,
);

await writeFile(
  path.join(functionDir, 'index.mjs'),
  `import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from './server/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(currentDir, 'static');

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function toWebRequest(req) {
  const protocol = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  const url = new URL(req.url ?? '/', protocol + '://' + host);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const init = { method: req.method, headers };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await readBody(req);
    init.duplex = 'half';
  }

  return new Request(url, init);
}

async function fetchAsset(request) {
  const url = new URL(request.url);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const filePath = path.normalize(path.join(staticRoot, pathname));
  if (!filePath.startsWith(staticRoot)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const data = await readFile(filePath);
    return new Response(data, {
      headers: {
        'content-type': contentType(filePath),
      },
    });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}

async function sendResponse(res, response) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'set-cookie') {
      res.setHeader(key, value);
    }
  });

  const setCookies = response.headers.getSetCookie?.();
  if (setCookies?.length) {
    res.setHeader('set-cookie', setCookies);
  }

  if (response.body) {
    const data = Buffer.from(await response.arrayBuffer());
    res.end(data);
  } else {
    res.end();
  }
}

export default async function handler(req, res) {
  try {
    const request = await toWebRequest(req);
    const response = await worker.fetch(
      request,
      {
        ...process.env,
        ASSETS: { fetch: fetchAsset },
      },
      {
        waitUntil() {},
        passThroughOnException() {},
      },
    );
    await sendResponse(res, response);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
`,
);

const config = JSON.parse(
  await readFile(path.join(outputDir, 'config.json'), 'utf8'),
);
if (!config.routes?.length) {
  throw new Error('Vercel output routes were not generated.');
}
