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

    const { name, email, company, message } = body;

    const safeName = escapeHtml(String(name).trim());
    const safeEmail = escapeHtml(String(email).trim());
    const safeCompany = escapeHtml(company ? String(company).trim() : '');
    const safeMessage = escapeHtml(String(message).trim()).replace(/\n/g, '<br>');

    await resend.emails.send({
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

    auditLog({ action: 'contact.submit', actor: 'anonymous', detail: String(email).trim(), ip, success: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
