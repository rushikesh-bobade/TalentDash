import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCompany } from '@/lib/normalize'
import { SalaryQuerySchema } from '@/lib/validators'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    const parsed = SalaryQuerySchema.safeParse(params)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { company, role, level, location, sort, order, page, limit } = parsed.data

    const where: Record<string, unknown> = {}
    if (company) where.company = { contains: normalizeCompany(company) }
    if (role) where.role = { contains: role, mode: 'insensitive' }
    if (level) where.level = level.replace(/-/g, '_')
    if (location) where.location = { contains: location, mode: 'insensitive' }

    const [total, rawSalaries] = await Promise.all([
      prisma.salary.count({ where }),
      prisma.salary.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const salaries = rawSalaries.map(s => ({
      ...s,
      level: s.level.replace(/_/g, '-')
    }))

    return NextResponse.json(
      {
        data: salaries,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/salaries error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
