import { NextResponse } from 'next/server';

// TODO: This endpoint needs to query all user data from Supabase (profile, contact
// form submissions, portal activity, audit logs) and compile it into a downloadable
// archive before returning it to the authenticated user.

export async function GET(request: Request) {
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
      'Data export request received. You will receive your data within 30 days per GDPR Article 15.',
  });
}
