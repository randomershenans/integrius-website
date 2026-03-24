import crypto from 'crypto'

const PRODUCT_CODES: Record<string, string> = {
  CORE: 'COR', OPTIC: 'OPT', SEARCH: 'SRC', SDK: 'SDK',
}
const TIER_CODES: Record<string, string> = {
  PILOT: 'PIL', ENTERPRISE: 'ENT', PLATFORM_LITE: 'PLT', PLATFORM: 'PLA',
  // legacy — kept for any existing keys
  STARTER: 'STR', GROWTH: 'GRW',
}
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // unambiguous characters only

export function generateLicenseKey(product: string, tier: string): string {
  const bytes = crypto.randomBytes(6)
  const random = Array.from(bytes).map(b => ALPHABET[b % ALPHABET.length]).join('')
  const body = `INT-${PRODUCT_CODES[product]}-${TIER_CODES[tier]}-${random}`
  const checksum = crypto.createHash('sha256').update(body).digest('hex').slice(0, 2).toUpperCase()
  return `${body}-${checksum}`
}

export function validateLicenseKeyFormat(key: string): boolean {
  return /^INT-[A-Z]{3}-[A-Z]{3}-[A-Z0-9]{8}-[A-F0-9]{2}$/.test(key)
}
