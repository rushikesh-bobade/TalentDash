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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    // Params are s1 and s2 (TalentDash spec)
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

    return NextResponse.json({
      salary_a,
      salary_b,
      diff: {
        base: salary_a.base_salary - salary_b.base_salary,
        bonus: salary_a.bonus - salary_b.bonus,
        stock: salary_a.stock - salary_b.stock,
        total: salary_a.total_compensation - salary_b.total_compensation,
        level_difference: getLevelDiff(salary_a.level, salary_b.level),
      },
    })
  } catch (err) {
    console.error('GET /api/compare error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
