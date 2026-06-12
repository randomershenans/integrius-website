import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auditLog } from '@/lib/audit-logger';

const resend = new Resend(process.env.RESEND_API_KEY);

// --- Rate limiting (in-memory, per-instance) ---
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// --- Input validation ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactForm(body: Record<string, unknown>): string | null {
  const { name, email, company, message } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'Name is required.';
  }
  if (name.trim().length > 200) {
    return 'Name must be 200 characters or fewer.';
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return 'Email is required.';
  }
  if (email.trim().length > 254) {
    return 'Email must be 254 characters or fewer.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please provide a valid email address.';
  }

  if (company !== undefined && company !== null && company !== '') {
    if (typeof company !== 'string') {
      return 'Company must be a string.';
    }
    if (company.trim().length > 200) {
      return 'Company must be 200 characters or fewer.';
    }
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return 'Message is required.';
  }
  if (message.trim().length > 5000) {
    return 'Message must be 5,000 characters or fewer.';
  }

  return null;
}

// --- Spam detection ---
// The form includes a honeypot field, the time elapsed since mount, and the
// fields themselves are checked for keyboard-mash gibberish. Spam is dropped
// SILENTLY (fake success) so bots get no signal to adapt against.

const MIN_FILL_TIME_MS = 3000;

function looksGibberish(value: string): boolean {
  const s = value.trim();
  if (s.length < 8 || s.includes(' ')) return false;
  const letters = s.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 8) return false;

  const vowels = (letters.match(/[aeiouAEIOU]/g) ?? []).length;
  if (vowels / letters.length < 0.2) return true;

  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(letters)) return true;

  // Random-case mashes ("JYQnQdgffiodPSsGjHpyUIo") flip case constantly;
  // real words and names ("McDonald", "iPhone") flip once or twice.
  let caseFlips = 0;
  for (let i = 1; i < letters.length; i++) {
    const prevUpper = letters[i - 1] === letters[i - 1].toUpperCase();
    const curUpper = letters[i] === letters[i].toUpperCase();
    if (prevUpper !== curUpper) caseFlips++;
  }
  if (letters.length >= 12 && caseFlips / letters.length > 0.3) return true;

  return false;
}

function spamReason(body: Record<string, unknown>): string | null {
  // Honeypot: invisible to humans, autofilled by form bots
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return 'honeypot';
  }

  // Time trap: humans take longer than 3 seconds; direct-POST bots omit it
  const elapsed = typeof body.t === 'number' ? body.t : -1;
  if (elapsed < MIN_FILL_TIME_MS) {
    return 'time-trap';
  }

  const name = String(body.name ?? '');
  const company = String(body.company ?? '');
  const message = String(body.message ?? '').trim();

  // Real messages contain words; keyboard mash is one spaceless token
  let score = 0;
  if (looksGibberish(message) || (message.length >= 12 && !message.includes(' '))) score += 2;
  if (looksGibberish(name)) score += 1;
  if (looksGibberish(company)) score += 1;
  if (score >= 2) return `gibberish (score ${score})`;

  return null;
}

// --- HTML escaping ---
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- Recipient from env with fallback ---
const CONTACT_RECIPIENT = process.env.CONTACT_FORM_RECIPIENT || 'info@integri.us';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting — check first before any processing
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await req.json();

    // Validate inputs
    const validationError = validateContactForm(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Spam check: drop silently with a fake success so bots learn nothing
    const spam = spamReason(body);
    if (spam) {
      auditLog({ action: 'contact.spam_blocked', actor: 'anonymous', detail: spam, ip, success: true });
      return NextResponse.json({ success: true });
    }

    const { name, email, company, message } = body;

    const safeName = escapeHtml(String(name).trim());
    const safeEmail = escapeHtml(String(email).trim());
    const safeCompany = escapeHtml(company ? String(company).trim() : '');
    const safeMessage = escapeHtml(String(message).trim()).replace(/\n/g, '<br>');

    // Resend returns errors rather than throwing; surface them or the user
    // sees success while no email was sent
    const { error: sendError } = await resend.emails.send({
      from: 'Integrius Contact Form <contact@notifications.integri.us>',
      to: [CONTACT_RECIPIENT],
      replyTo: email,
      subject: `New Contact Form Submission from ${safeCompany || safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Company:</strong> ${safeCompany || '(not provided)'}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    if (sendError) {
      auditLog({ action: 'contact.submit', actor: 'anonymous', detail: `send failed: ${sendError.message}`, ip, success: false });
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    auditLog({ action: 'contact.submit', actor: 'anonymous', detail: String(email).trim(), ip, success: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
