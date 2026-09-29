import 'server-only';

// Server-side client for the submissions Worker (cloudflare/worker), which
// owns the D1 database. The tokens never reach the browser: this module is
// server-only and none of these variables are NEXT_PUBLIC_.

export type Submission = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

export type SubmissionInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const TIMEOUT_MS = 10_000;

function config(tokenName: 'SUBMIT_API_TOKEN' | 'ADMIN_API_TOKEN') {
  const baseUrl = process.env.SUBMISSIONS_API_URL;
  const token = process.env[tokenName];
  if (!baseUrl || !token) {
    throw new Error(`SUBMISSIONS_API_URL and ${tokenName} must be set`);
  }
  return { url: `${baseUrl.replace(/\/+$/, '')}/submissions`, token };
}

/** Stores a submission. Resolves to 'rate_limited' when the sender posted too often. */
export async function createSubmission(
  input: SubmissionInput,
  clientIp: string | null,
): Promise<'created' | 'rate_limited'> {
  const { url, token } = config('SUBMIT_API_TOKEN');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(clientIp ? { 'X-Client-IP': clientIp } : {}),
    },
    body: JSON.stringify(input),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (response.status === 429) return 'rate_limited';
  if (!response.ok) throw new Error(`Submissions API responded ${response.status}`);
  return 'created';
}

/** Newest first. Callers must have checked that the viewer is an admin. */
export async function listSubmissions(): Promise<Submission[]> {
  const { url, token } = config('ADMIN_API_TOKEN');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Submissions API responded ${response.status}`);
  const { submissions } = (await response.json()) as { submissions: Submission[] };
  return submissions;
}
