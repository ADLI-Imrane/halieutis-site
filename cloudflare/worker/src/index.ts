/**
 * Submissions API: the only thing that touches the D1 database.
 *
 * It is called server-to-server by the Next.js app on Vercel, never by a
 * browser, so it sends no CORS headers. Two bearer tokens split the rights:
 *   POST /submissions  SUBMIT_API_TOKEN  create one submission
 *   GET  /submissions  ADMIN_API_TOKEN   list submissions (dashboard)
 * A leaked submit token therefore cannot read anything.
 */

interface Env {
  DB: D1Database;
  SUBMIT_API_TOKEN: string;
  ADMIN_API_TOKEN: string;
}

interface SubmissionInput {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}

// Keep in step with the CHECK constraints in migrations/0001_create_submissions.sql.
const LIMITS = { name: 200, email: 254, subject: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY_BYTES = 16 * 1024;
const MIN_TOKEN_LENGTH = 32;
// Per sender IP: at most 5 submissions per 10 minutes.
const RATE_LIMIT = { max: 5, windowSeconds: 600 };
// Same ceiling as the Supabase API's default row limit the dashboard had before.
const LIST_LIMIT = 1000;

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/submissions') {
        if (request.method === 'POST') return await createSubmission(request, env);
        if (request.method === 'GET') return await listSubmissions(request, env);
        return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
      }
      if (pathname === '/health' && request.method === 'GET') return json({ ok: true });
      return json({ error: 'not_found' }, 404);
    } catch (err) {
      // Never log the request body: it is a visitor's personal data.
      console.error('Unhandled error', {
        method: request.method,
        path: pathname,
        error: err instanceof Error ? err.message : 'unknown',
      });
      return json({ error: 'internal_error' }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

async function createSubmission(request: Request, env: Env): Promise<Response> {
  if (!(await hasToken(request, env.SUBMIT_API_TOKEN))) {
    return json({ error: 'unauthorized' }, 401);
  }

  const body = await readJson(request);
  if (body === undefined) return json({ error: 'invalid_body' }, 400);
  const input = validate(body);
  if (!input) return json({ error: 'invalid_input' }, 400);

  const clientIp = request.headers.get('X-Client-IP')?.trim();
  const ipHash = clientIp ? await hmacHex(env.SUBMIT_API_TOKEN, clientIp) : null;

  if (ipHash) {
    const since = new Date(Date.now() - RATE_LIMIT.windowSeconds * 1000).toISOString();
    const recent = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM submissions WHERE ip_hash = ?1 AND created_at > ?2',
    )
      .bind(ipHash, since)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= RATE_LIMIT.max) {
      return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(RATE_LIMIT.windowSeconds) });
    }
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO submissions (id, name, email, subject, message, created_at, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
  )
    .bind(id, input.name, input.email, input.subject, input.message, createdAt, ipHash)
    .run();

  return json({ id, created_at: createdAt }, 201);
}

async function listSubmissions(request: Request, env: Env): Promise<Response> {
  // Refuse admin access outright if both tokens were set to the same value,
  // since that would let the submit token read every lead.
  if (env.ADMIN_API_TOKEN === env.SUBMIT_API_TOKEN || !(await hasToken(request, env.ADMIN_API_TOKEN))) {
    return json({ error: 'unauthorized' }, 401);
  }

  const { results } = await env.DB.prepare(
    'SELECT id, name, email, subject, message, created_at FROM submissions ORDER BY created_at DESC LIMIT ?1',
  )
    .bind(LIST_LIMIT)
    .all();

  return json({ submissions: results });
}

function validate(body: unknown): SubmissionInput | null {
  if (typeof body !== 'object' || body === null) return null;
  const fields = body as Record<string, unknown>;
  const name = text(fields.name);
  const email = text(fields.email);
  const subject = text(fields.subject);
  const message = text(fields.message);

  if (!name || !email || !message) return null;
  if (!EMAIL_RE.test(email)) return null;
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    subject.length > LIMITS.subject ||
    message.length > LIMITS.message
  ) {
    return null;
  }
  return { name, email, subject: subject || null, message };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get('Content-Type')?.includes('application/json')) return undefined;
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function hasToken(request: Request, expected: string | undefined): Promise<boolean> {
  // A missing or weak secret must mean "closed", never "open".
  if (!expected || expected.length < MIN_TOKEN_LENGTH) return false;
  const header = request.headers.get('Authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!provided) return false;
  // Hash both sides so the constant-time compare always sees equal lengths.
  const [a, b] = await Promise.all([sha256(provided), sha256(expected)]);
  return crypto.subtle.timingSafeEqual(a, b);
}

async function sha256(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
}

async function hmacHex(key: string, value: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}
