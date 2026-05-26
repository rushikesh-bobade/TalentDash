import { prisma } from '@/lib/prisma'
import { formatCurrency, calculateMedian } from '@/lib/normalize'
import Link from 'next/link'

export const revalidate = 3600

export default async function TitlesPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params

  const salaries = await prisma.salary.findMany({
    select: { role: true, total_compensation: true, level: true },
  })

  // Group by role
  const grouped = salaries.reduce((acc, s) => {
    if (!acc[s.role]) acc[s.role] = []
    acc[s.role].push(s)
    return acc
  }, {} as Record<string, typeof salaries>)

  const titleCards = Object.entries(grouped)
    .map(([role, records]) => {
      const comps = records.map(r => r.total_compensation)
      const levels = [...new Set(records.map(r => r.level.replace(/_/g, '-')))]
      return {
        role,
        count: records.length,
        medianTC: calculateMedian(comps),
        minTC: Math.min(...comps),
        maxTC: Math.max(...comps),
        levels: levels.sort(),
      }
    })
    .sort((a, b) => b.medianTC - a.medianTC)

  const roleEmoji: Record<string, string> = {
    'Software Engineer': '💻',
    'Senior Software Engineer': '🧑‍💻',
    'Staff Engineer': '🏗️',
    'Engineering Manager': '👔',
    'Data Scientist': '📊',
    'Product Manager': '📋',
    'DevOps Engineer': '⚙️',
    'Frontend Engineer': '🎨',
    'Backend Engineer': '🔧',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/${country}/salaries`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Salaries
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Salaries by Job Title
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Explore compensation data across {titleCards.length} tech roles. Click any title to see detailed level-wise breakdowns.
        </p>
      </div>

      {/* Title Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {titleCards.map((tc) => (
          <Link
            key={tc.role}
            href={`/${country}/salaries/title/${encodeURIComponent(tc.role.toLowerCase().replace(/\s+/g, '-'))}`}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{roleEmoji[tc.role] || '💼'}</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tc.role}
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Median Total Comp</div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {formatCurrency(tc.medianTC)}
                </div>
              </div>

              <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Min: {formatCurrency(tc.minTC)}</span>
                <span>Max: {formatCurrency(tc.maxTC)}</span>
              </div>

              {/* Range bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" style={{ width: `${Math.min((tc.medianTC / (titleCards[0]?.medianTC || 1)) * 100, 100)}%` }} />
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1 flex-wrap">
                  {tc.levels.map(l => (
                    <span key={l} className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {l}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400">{tc.count} records</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
