import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCompany } from '@/lib/normalize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const slug = normalizeCompany(decodeURIComponent(resolvedParams.slug))

    const salaries = await prisma.salary.findMany({
      where: { company: slug },
      orderBy: { total_compensation: 'desc' },
    })

    const reviews = await prisma.review.findMany({
      where: { company: slug },
      orderBy: { created_at: 'desc' },
    })

    const interviews = await prisma.interview.findMany({
      where: { company: slug },
      orderBy: { created_at: 'desc' },
    })

    if (salaries.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Calculate Median
    const tcArray = salaries.map(s => s.total_compensation).sort((a, b) => a - b)
    const mid = Math.floor(tcArray.length / 2)
    const median_compensation = tcArray.length % 2 === 0 
      ? (tcArray[mid - 1] + tcArray[mid]) / 2 
      : tcArray[mid]

    // Level Distribution
    const level_distribution = salaries.reduce((acc, curr) => {
      const level = curr.level.replace(/_/g, '-')
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json(
      {
        company: slug,
        total_entries: salaries.length,
        median_compensation,
        level_distribution,
        salaries: salaries.map(s => ({ ...s, level: s.level.replace(/_/g, '-') })),
        reviews,
        interviews,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/companies/[slug] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
