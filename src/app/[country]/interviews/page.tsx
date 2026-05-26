import { prisma } from '@/lib/prisma'
import { titleCase } from '@/lib/normalize'
import Link from 'next/link'

export const revalidate = 3600

export default async function InterviewsPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params

  const interviews = await prisma.interview.findMany({
    orderBy: { created_at: 'desc' },
  })

  // Group by company
  const grouped = interviews.reduce((acc, i) => {
    if (!acc[i.company]) acc[i.company] = []
    acc[i.company].push(i)
    return acc
  }, {} as Record<string, typeof interviews>)

  const companySummaries = Object.entries(grouped)
    .map(([company, intrvws]) => {
      const accepted = intrvws.filter(i => i.offer_status === 'ACCEPTED').length
      const rejected = intrvws.filter(i => i.offer_status === 'REJECTED').length
      const noOffer = intrvws.filter(i => i.offer_status === 'NO_OFFER').length
      return {
        company,
        count: intrvws.length,
        avgDifficulty: +(intrvws.reduce((s, i) => s + i.difficulty, 0) / intrvws.length).toFixed(1),
        avgDuration: Math.round(intrvws.reduce((s, i) => s + i.process_duration, 0) / intrvws.length),
        accepted,
        rejected,
        noOffer,
        roles: [...new Set(intrvws.map(i => i.role))],
      }
    })
    .sort((a, b) => b.count - a.count)

  const difficultyColor = (d: number) => {
    if (d <= 2) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    if (d <= 3.5) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
  }

  const difficultyLabel = (d: number) => {
    if (d <= 2) return 'Easy'
    if (d <= 3) return 'Medium'
    if (d <= 4) return 'Hard'
    return 'Very Hard'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/${country}`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Interview Experiences
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Real interview questions, difficulty ratings, and process timelines shared anonymously by candidates across top tech companies.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-bold">
            {interviews.length} Experiences
          </span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-bold">
            {companySummaries.length} Companies
          </span>
        </div>
      </div>

      {/* Company Interview Cards */}
      <div className="grid gap-6">
        {companySummaries.map((cs) => (
          <div key={cs.company} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-2xl font-black text-slate-400 dark:text-slate-600 capitalize">
                  {cs.company.charAt(0)}
                </div>
                <div>
                  <Link href={`/${country}/companies/${cs.company}`} className="text-xl font-black text-slate-900 dark:text-slate-100 capitalize hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {titleCase(cs.company)}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {cs.count} experience{cs.count !== 1 ? 's' : ''} · Avg {cs.avgDuration} days
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className={`px-3 py-2 rounded-lg text-center min-w-[70px] ${difficultyColor(cs.avgDifficulty)}`}>
                  <div className="text-xl font-black">{cs.avgDifficulty}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">{difficultyLabel(cs.avgDifficulty)}</div>
                </div>
              </div>
            </div>

            {/* Offer Status Bar */}
            <div className="mb-4">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {cs.accepted > 0 && (
                  <div className="bg-green-500" style={{ width: `${(cs.accepted / cs.count) * 100}%` }} title={`${cs.accepted} Accepted`} />
                )}
                {cs.rejected > 0 && (
                  <div className="bg-red-400" style={{ width: `${(cs.rejected / cs.count) * 100}%` }} title={`${cs.rejected} Rejected`} />
                )}
                {cs.noOffer > 0 && (
                  <div className="bg-slate-300 dark:bg-slate-600" style={{ width: `${(cs.noOffer / cs.count) * 100}%` }} title={`${cs.noOffer} No Offer`} />
                )}
              </div>
              <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                {cs.accepted > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Accepted ({cs.accepted})</span>}
                {cs.rejected > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Rejected ({cs.rejected})</span>}
                {cs.noOffer > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />No Offer ({cs.noOffer})</span>}
              </div>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap gap-2 mb-4">
              {cs.roles.map(role => (
                <span key={role} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs font-bold">
                  {role}
                </span>
              ))}
            </div>

            {/* Sample Questions */}
            {grouped[cs.company][0]?.questions?.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Questions</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {grouped[cs.company][0].questions.slice(0, 2).map((q, idx) => (
                    <li key={idx} className="line-clamp-1">{q}</li>
                  ))}
                </ul>
                <Link href={`/${country}/companies/${cs.company}`} className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 inline-flex items-center gap-1">
                  See all questions &rarr;
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
