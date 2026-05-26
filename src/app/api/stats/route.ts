import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateMedian } from '@/lib/normalize'

export async function GET() {
  try {
    const [totalRecords, companies, allSalaries] = await Promise.all([
      prisma.salary.count(),
      prisma.salary.findMany({ select: { company: true }, distinct: ['company'] }),
      prisma.salary.findMany({ select: { company: true, total_compensation: true } }),
    ])

    const companyMap: Record<string, number[]> = {}
    for (const s of allSalaries) {
      if (!companyMap[s.company]) companyMap[s.company] = []
      companyMap[s.company].push(s.total_compensation)
    }

    const topCompanies = Object.entries(companyMap)
      .map(([name, values]) => ({
        name,
        medianTC: calculateMedian(values),
        count: values.length,
      }))
      .sort((a, b) => b.medianTC - a.medianTC)
      .slice(0, 5)

    return NextResponse.json(
      {
        totalRecords,
        uniqueCompanies: companies.length,
        topCompanies,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (err) {
    console.error('GET /api/stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
