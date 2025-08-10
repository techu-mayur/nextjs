import type { NextRequest } from 'next/server';

function parseForwarded(forwarded: string | null): string | null {
  if (!forwarded) return null;
  try {
    // The Forwarded header may contain multiple entries separated by commas
    // Example: for=192.0.2.60; proto=http; by=203.0.113.43
    const parts = forwarded.split(',');
    for (const part of parts) {
      const m = /for=([^;]+)/i.exec(part.trim());
      if (m && m[1]) {
        let ip = m[1].trim();
        // Remove quotes and brackets
        ip = ip.replace(/^"|"$/g, '').replace(/^\[/, '').replace(/\]$/, '');
        return ip;
      }
    }
  } catch {}
  return null;
}

export function getClientIp(request: NextRequest): string {
  // Prefer Next.js-provided IP if available (e.g., Vercel)
  const anyReq = request as unknown as { ip?: string | null };
  if (anyReq.ip && anyReq.ip.trim() !== '') {
    return normalizeIp(anyReq.ip);
  }
  // Try common proxy headers first
  const headerOrder = [
    'cf-connecting-ip',
    'x-client-ip',
    'x-forwarded-for',
    'x-real-ip',
    'fastly-client-ip',
    'true-client-ip',
    'x-cluster-client-ip',
  ];

  for (const name of headerOrder) {
    const value = request.headers.get(name);
    if (value && value.trim() !== '') {
      // x-forwarded-for can be a comma-separated list
      const first = value.split(',')[0].trim();
      if (first) return normalizeIp(first);
    }
  }

  // Parse standardized Forwarded header
  const forwarded = request.headers.get('forwarded');
  const parsed = parseForwarded(forwarded);
  if (parsed) return normalizeIp(parsed);

  // Fallbacks
  const remoteAddr = request.headers.get('remote-addr');
  if (remoteAddr && remoteAddr.trim() !== '') return normalizeIp(remoteAddr.trim());

  // Local dev fallback
  return '127.0.0.1';
}

function normalizeIp(ip: string): string {
  let v = ip.replace(/^"|"$/g, '').replace(/^\[/, '').replace(/\]$/, '');
  // Strip IPv6 IPv4-mapped prefix ::ffff:
  if (v.startsWith('::ffff:')) v = v.substring(7);
  // Normalize IPv6 loopback to IPv4 loopback for dev readability
  if (v === '::1' || v === '0:0:0:0:0:0:0:1') v = '127.0.0.1';
  return v;
}


