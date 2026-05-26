import { prisma } from '@/lib/prisma'
import { titleCase } from '@/lib/normalize'
import Link from 'next/link'

export const revalidate = 3600

export default async function ReviewsPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params

  const reviews = await prisma.review.findMany({
    orderBy: { created_at: 'desc' },
  })

  // Group reviews by company
  const grouped = reviews.reduce((acc, r) => {
    if (!acc[r.company]) acc[r.company] = []
    acc[r.company].push(r)
    return acc
  }, {} as Record<string, typeof reviews>)

  // Calculate avg rating per company
  const companySummaries = Object.entries(grouped)
    .map(([company, revs]) => ({
      company,
      count: revs.length,
      avgRating: +(revs.reduce((s, r) => s + r.rating_overall, 0) / revs.length).toFixed(1),
      avgWlb: +(revs.reduce((s, r) => s + r.rating_wlb, 0) / revs.length).toFixed(1),
      avgCulture: +(revs.reduce((s, r) => s + r.rating_culture, 0) / revs.length).toFixed(1),
      avgComp: +(revs.reduce((s, r) => s + r.rating_comp, 0) / revs.length).toFixed(1),
    }))
    .sort((a, b) => b.avgRating - a.avgRating)

  const starBar = (val: number) => {
    const pct = (val / 5) * 100
    return pct
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/${country}`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Company Reviews
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Anonymous, verified employee reviews. Honest insights on culture, work-life balance, and compensation across top Indian tech companies.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-bold">
            {reviews.length} Reviews
          </span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-bold">
            {companySummaries.length} Companies
          </span>
        </div>
      </div>

      {/* Anonymous Safe Space Banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-5 mb-10 flex items-start gap-4">
        <span className="text-2xl">🛡️</span>
        <div>
          <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-300">Your Anonymous Safe Space</h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
            All reviews are 100% anonymous. No accounts, no IP tracking. Share your honest experience to help others make better career decisions.
          </p>
        </div>
      </div>

      {/* Company Review Cards */}
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
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{cs.count} review{cs.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-center min-w-[80px]">
                <div className="text-2xl font-black">{cs.avgRating}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider">Overall</div>
              </div>
            </div>

            {/* Rating Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Work-Life Balance</span><span>{cs.avgWlb}/5</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${starBar(cs.avgWlb)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Culture</span><span>{cs.avgCulture}/5</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${starBar(cs.avgCulture)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Compensation</span><span>{cs.avgComp}/5</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${starBar(cs.avgComp)}%` }} />
                </div>
              </div>
            </div>

            {/* Latest Review Snippet */}
            {grouped[cs.company][0] && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Pros</h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{grouped[cs.company][0].pros}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">Cons</h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{grouped[cs.company][0].cons}</p>
                  </div>
                </div>
                <Link href={`/${country}/companies/${cs.company}`} className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 inline-flex items-center gap-1">
                  Read all {cs.count} reviews &rarr;
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
