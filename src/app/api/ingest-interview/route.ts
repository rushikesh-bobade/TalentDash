import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const InterviewSchema = z.object({
  company: z.string().min(2).transform(s => s.trim().toLowerCase()),
  role: z.string().min(2),
  difficulty: z.number().int().min(1).max(5),
  offer_status: z.enum(['ACCEPTED', 'REJECTED', 'NO_OFFER']),
  process_duration: z.number().int().min(1),
  questions: z.array(z.string()).min(1),
  experience: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = InterviewSchema.safeParse(body)

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

    const interview = await prisma.interview.create({
      data: {
        company: data.company,
        role: data.role,
        difficulty: data.difficulty,
        offer_status: data.offer_status,
        process_duration: data.process_duration,
        questions: data.questions,
        experience: data.experience,
        is_anonymous: true,
      },
    })

    return NextResponse.json({ success: true, data: interview }, { status: 201 })
  } catch (err) {
    console.error('POST /api/ingest-interview error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
