import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const jwtSecret = process.env.CMS_JWT_SECRET;
if (!jwtSecret) throw new Error('CMS_JWT_SECRET environment variable is not set');
const secret = new TextEncoder().encode(jwtSecret);

const COOKIE = 'cms_admin_token';
const TTL_HOURS = 12;

export interface AdminSession {
  adminId: string;
  email: string;
}

export async function signAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_HOURS}h`)
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function setAdminCookie(token: string): { name: string; value: string; httpOnly: boolean; secure: boolean; sameSite: 'lax'; path: string; maxAge: number } {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_HOURS * 60 * 60,
  };
}

export const ADMIN_COOKIE = COOKIE;
