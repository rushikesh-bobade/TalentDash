import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Level } from '@prisma/client'
import { normalizeCompany } from '@/lib/normalize'
import { SalaryIngestionSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SalaryIngestionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = parsed.data
    const company = normalizeCompany(data.company)
    const bonus = data.bonus ?? 0
    const stock = data.stock ?? 0

    // CRITICAL: Always compute total server-side — never trust client
    const total_compensation = data.base_salary + bonus + stock

    const dbLevel = data.level.replace(/-/g, '_') as Level

    // Duplicate detection
    const existing = await prisma.salary.findFirst({
      where: {
        company,
        role: data.role,
        level: dbLevel,
        location: data.location,
        base_salary: {
          gte: data.base_salary * 0.95,
          lte: data.base_salary * 1.05,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          error: 'Duplicate entry detected',
          message: 'A similar salary record already exists',
          existing_id: existing.id,
        },
        { status: 409 }
      )
    }

    const salary = await prisma.salary.create({
      data: {
        company,
        role: data.role,
        level: dbLevel,
        location: data.location,
        experience_years: data.experience_years,
        base_salary: data.base_salary,
        bonus,
        stock,
        total_compensation,
        confidence_score: data.confidence_score ?? 0.8,
      },
    })

    return NextResponse.json({ success: true, data: salary }, { status: 201 })
  } catch (err) {
    console.error('POST /api/ingest-salary error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
