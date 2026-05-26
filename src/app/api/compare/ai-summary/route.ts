import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

export async function POST(req: NextRequest) {
  if (!groq) {
    return NextResponse.json({ summary: null })
  }

  try {
    const data = await req.json()
    const { salary_a, salary_b, meta_a, meta_b, diff } = data

    const prompt = `You are a career compensation analyst. Compare these two offers and provide an insightful 3-4 sentence analysis. Be specific with numbers.

Offer A: ${salary_a.company} ${salary_a.level} ${salary_a.role}
- Total Comp: ₹${salary_a.total_compensation}
- Base: ₹${salary_a.base_salary}, Stock: ₹${salary_a.stock}, Bonus: ₹${salary_a.bonus}
- Experience: ${salary_a.experience_years} years
- WLB Score: ${meta_a.wlb}/5, Career Growth: ${meta_a.career_growth}/5
- Benefits Value: ~₹${meta_a.benefits_value}

Offer B: ${salary_b.company} ${salary_b.level} ${salary_b.role}
- Total Comp: ₹${salary_b.total_compensation}
- Base: ₹${salary_b.base_salary}, Stock: ₹${salary_b.stock}, Bonus: ₹${salary_b.bonus}
- Experience: ${salary_b.experience_years} years
- WLB Score: ${meta_b.wlb}/5, Career Growth: ${meta_b.career_growth}/5
- Benefits Value: ~₹${meta_b.benefits_value}

TC Difference: ₹${diff.total}
Level Comparison: ${diff.level_difference}

Provide a concise, actionable analysis focusing on which offer wins on different dimensions (comp, growth, WLB) and what the candidate should prioritize. Use Indian Rupee formatting (L for Lakhs, Cr for Crores).`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert career and compensation analyst specializing in Indian tech market salaries. Be direct and insightful. Use ₹ formatting.' },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 250,
    })

    return NextResponse.json({
      summary: completion.choices[0]?.message?.content || null,
    })
  } catch (err) {
    console.error('AI Summary error:', err)
    return NextResponse.json({ summary: null })
  }
}
