import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const LEVEL_ORDER = ['L3', 'SDE-I', 'L4', 'SDE-II', 'L5', 'SDE-III', 'L6', 'Staff', 'Principal']

function getLevelDiff(a: string, b: string): string {
  const ai = LEVEL_ORDER.indexOf(a)
  const bi = LEVEL_ORDER.indexOf(b)
  if (ai === -1 || bi === -1) return `${a} vs ${b}`
  if (ai === bi) return 'Same level'
  const diff = Math.abs(ai - bi)
  return ai < bi
    ? `${b} is ${diff} level(s) above ${a}`
    : `${a} is ${diff} level(s) above ${b}`
}

// Derived metrics based on company reputation data
const COMPANY_META: Record<string, { wlb: number; career_growth: number; benefits_value: number; rsu_cliff_months: number }> = {
  google:     { wlb: 4.2, career_growth: 4.6, benefits_value: 1100000, rsu_cliff_months: 12 },
  microsoft:  { wlb: 4.4, career_growth: 4.3, benefits_value: 900000,  rsu_cliff_months: 12 },
  amazon:     { wlb: 3.0, career_growth: 4.1, benefits_value: 800000,  rsu_cliff_months: 12 },
  meta:       { wlb: 3.8, career_growth: 4.5, benefits_value: 1000000, rsu_cliff_months: 12 },
  flipkart:   { wlb: 4.0, career_growth: 4.0, benefits_value: 900000,  rsu_cliff_months: 12 },
  swiggy:     { wlb: 3.5, career_growth: 3.8, benefits_value: 500000,  rsu_cliff_months: 12 },
  razorpay:   { wlb: 3.7, career_growth: 4.2, benefits_value: 600000,  rsu_cliff_months: 12 },
  zepto:      { wlb: 2.8, career_growth: 3.5, benefits_value: 400000,  rsu_cliff_months: 12 },
  groww:      { wlb: 3.6, career_growth: 3.9, benefits_value: 500000,  rsu_cliff_months: 12 },
  paytm:      { wlb: 3.3, career_growth: 3.4, benefits_value: 500000,  rsu_cliff_months: 12 },
  atlassian:  { wlb: 4.5, career_growth: 4.4, benefits_value: 1000000, rsu_cliff_months: 12 },
  adobe:      { wlb: 4.3, career_growth: 4.2, benefits_value: 900000,  rsu_cliff_months: 12 },
  nvidia:     { wlb: 3.9, career_growth: 4.3, benefits_value: 950000,  rsu_cliff_months: 12 },
  infosys:    { wlb: 3.8, career_growth: 3.0, benefits_value: 300000,  rsu_cliff_months: 0 },
  tcs:        { wlb: 3.9, career_growth: 2.8, benefits_value: 250000,  rsu_cliff_months: 0 },
  wipro:      { wlb: 3.7, career_growth: 2.9, benefits_value: 250000,  rsu_cliff_months: 0 },
  salesforce: { wlb: 4.1, career_growth: 4.0, benefits_value: 850000,  rsu_cliff_months: 12 },
  oracle:     { wlb: 3.6, career_growth: 3.5, benefits_value: 700000,  rsu_cliff_months: 12 },
}

const DEFAULT_META = { wlb: 3.5, career_growth: 3.5, benefits_value: 500000, rsu_cliff_months: 12 }

function getCompanyMeta(company: string) {
  const key = company.toLowerCase().trim()
  return COMPANY_META[key] || DEFAULT_META
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const s1 = searchParams.get('s1')
    const s2 = searchParams.get('s2')

    if (!s1 || !s2) {
      return NextResponse.json(
        { error: 'Missing parameters', message: 'Both s1 and s2 query params are required' },
        { status: 400 }
      )
    }

    if (s1 === s2) {
      return NextResponse.json(
        { error: 'Invalid comparison', message: 'Cannot compare a salary record with itself' },
        { status: 400 }
      )
    }

    const [salary_a, salary_b] = await Promise.all([
      prisma.salary.findUnique({ where: { id: s1 } }),
      prisma.salary.findUnique({ where: { id: s2 } }),
    ])

    if (!salary_a || !salary_b) {
      return NextResponse.json(
        { error: 'Not found', message: 'One or both salary IDs do not exist' },
        { status: 404 }
      )
    }

    const meta_a = getCompanyMeta(salary_a.company)
    const meta_b = getCompanyMeta(salary_b.company)

    return NextResponse.json({
      salary_a: { ...salary_a, level: salary_a.level.replace(/_/g, '-') },
      salary_b: { ...salary_b, level: salary_b.level.replace(/_/g, '-') },
      meta_a,
      meta_b,
      diff: {
        base: salary_a.base_salary - salary_b.base_salary,
        bonus: salary_a.bonus - salary_b.bonus,
        stock: salary_a.stock - salary_b.stock,
        total: salary_a.total_compensation - salary_b.total_compensation,
        experience: salary_a.experience_years - salary_b.experience_years,
        level_difference: getLevelDiff(
          salary_a.level.replace(/_/g, '-'),
          salary_b.level.replace(/_/g, '-')
        ),
      },
    })
  } catch (err) {
    console.error('GET /api/compare error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
