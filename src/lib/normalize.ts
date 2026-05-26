// Company name normalization — handles all variants:
// "Google", "GOOGLE", "google ", "Google Inc.", "Google LLC" → "google"
// "TCS", "TCS Ltd.", "Tata Consultancy", "Tata Consultancy Services" → "tcs"
// "Meta", "Facebook", "Meta Platforms" → "meta"

const COMPANY_ALIASES: Record<string, string> = {
  'facebook': 'meta',
  'meta platforms': 'meta',
  'tata consultancy services': 'tcs',
  'tata consultancy': 'tcs',
  'tcs ltd': 'tcs',
  'tcs ltd.': 'tcs',
  'google llc': 'google',
  'google inc': 'google',
  'google inc.': 'google',
  'microsoft corporation': 'microsoft',
  'amazon.com': 'amazon',
  'amazon web services': 'aws',
}

export function normalizeCompany(name: string): string {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,]+$/, '')

  return COMPANY_ALIASES[cleaned] ?? cleaned
}

export function formatCurrency(amount: number): string {
  if (!amount || isNaN(amount)) return '—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹ ${(amount / 1000).toFixed(1)}K`
  return `₹ ${amount}`
}

export function calculateMedian(values: number[]): number {
  if (!values || values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function calculatePercentile(values: number[], p: number): number {
  if (!values || values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

export function titleCase(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
