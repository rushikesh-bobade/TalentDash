import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ReviewSchema = z.object({
  company: z.string().min(2).transform(s => s.trim().toLowerCase()),
  rating_overall: z.number().int().min(1).max(5),
  rating_wlb: z.number().int().min(1).max(5),
  rating_culture: z.number().int().min(1).max(5),
  rating_comp: z.number().int().min(1).max(5),
  pros: z.string().min(10),
  cons: z.string().min(10),
  advice: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ReviewSchema.safeParse(body)

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

    const review = await prisma.review.create({
      data: {
        company: data.company,
        rating_overall: data.rating_overall,
        rating_wlb: data.rating_wlb,
        rating_culture: data.rating_culture,
        rating_comp: data.rating_comp,
        pros: data.pros,
        cons: data.cons,
        advice: data.advice,
        is_anonymous: true,
      },
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (err) {
    console.error('POST /api/ingest-review error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
