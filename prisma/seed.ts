// Bootstrap the admin user for the admin UI (cms_admin_users backs the custom
// JWT login at /admin/login). The blog needs no seeding: it is git-native
// markdown in content/blog/.
//
// Run: npm run db:seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail    = process.env.CMS_ADMIN_EMAIL;
  const adminPassword = process.env.CMS_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) throw new Error('CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD env vars are required to seed');

  const existing = await prisma.cms_admin_users.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.cms_admin_users.create({
      data: {
        email: adminEmail,
        password_hash: await bcrypt.hash(adminPassword, 12),
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
