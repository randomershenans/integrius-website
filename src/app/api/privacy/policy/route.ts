import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    dataCollected: {
      contactForm: ['name', 'email', 'company', 'message'],
      portal: ['authentication credentials', 'usage activity', 'audit logs'],
    },
    retentionPeriods: {
      contactFormSubmissions: '12 months after last interaction',
      portalAccountData: 'Duration of active subscription plus 30 days',
      auditLogs: '24 months',
      analyticsData: '26 months (anonymized after 6 months)',
    },
    gdprRights: {
      access:
        'You may request a copy of all personal data we hold about you (Article 15).',
      rectification:
        'You may request correction of inaccurate personal data (Article 16).',
      erasure:
        'You may request deletion of your personal data (Article 17).',
      portability:
        'You may request your data in a machine-readable format (Article 20).',
    },
    endpoints: {
      exportData: 'GET /api/privacy/export',
      deleteData: 'POST /api/privacy/delete',
      viewPolicy: 'GET /api/privacy/policy',
    },
  });
}
