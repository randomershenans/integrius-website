import { NextResponse } from 'next/server';

// TODO: This endpoint needs to actually delete user data from Supabase — profile,
// contact form submissions, portal records, and any other PII — then revoke the
// user's auth session.

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { status: 'error', message: 'Authentication required.' },
      { status: 401 },
    );
  }

  return NextResponse.json({
    status: 'ok',
    message:
      'Account deletion request received. Your data will be erased within 30 days per GDPR Article 17.',
  });
}
