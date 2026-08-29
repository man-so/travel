import { lookup } from 'node:dns/promises';
import net from 'node:net';

const maxContentLength = 16000;

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const parts = address.split('.').map(Number);
    const [a, b] = parts;
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && typeof b === 'number' && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    );
  }

  if (net.isIPv6(address)) {
    const value = address.toLowerCase();
    return value === '::1' || value.startsWith('fc') || value.startsWith('fd');
  }

  return false;
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https URLs are supported.');
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    throw new Error('Local URLs are not supported.');
  }

  const addresses = await lookup(hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error('Private network URLs are not supported.');
  }
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].replace(/\s+/g, ' ').trim()) : '';
}

function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6]|section|article)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

export async function extractUrlContent(inputUrl: string) {
  const url = new URL(inputUrl);
  await assertPublicUrl(url);

  const response = await fetch(url, {
    headers: {
      Accept: 'text/html, text/plain;q=0.9, */*;q=0.8',
      'User-Agent': 'WAYLOG AI Import MVP/1.0',
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch URL. (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = await response.text();
  const title = contentType.includes('text/html') ? extractTitle(body) : '';
  const text = contentType.includes('text/html') ? htmlToText(body) : body;

  if (!text.trim()) {
    throw new Error('No readable content was found at this URL.');
  }

  return {
    title,
    url: url.toString(),
    text: text.slice(0, maxContentLength),
  };
}
