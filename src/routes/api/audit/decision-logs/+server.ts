import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const BASE = (env.POLICY_ENFORCER_URL || 'http://policy_enforcer:8181').replace(/\/+$/, '');

export const GET: RequestHandler = async () => {
  try {
    const r = await fetch(`${BASE}/decision_logs`, { headers: { accept: 'application/json' } });
    const txt = await r.text();
    if (!r.ok) return new Response(txt || r.statusText, { status: r.status });

    // enforcer returns: [{ timestamp, input, allow }]
    const raw = JSON.parse(txt);
    const mapped = (Array.isArray(raw) ? raw : [raw]).map((e: any) => ({
      // adapt to what the UI component expects
      timestamp: e?.timestamp ?? null,
      path: 'guarddecision/allow',        // optional; not provided by enforcer
      result: e?.allow ?? null,           // map allow -> result
      input: e?.input ?? null,
      // keep original for the "Raw event" <pre>
      _original: e
    }));

    return new Response(JSON.stringify(mapped), { headers: { 'content-type': 'application/json' } });
  } catch (err: any) {
    return new Response(err?.message || 'Failed to fetch decision logs', { status: 502 });
  }
};
