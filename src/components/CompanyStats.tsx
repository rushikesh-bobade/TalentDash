'use client'

interface CompanyStatsProps {
  levelDistribution: Record<string, number>
  totalEntries: number
}

export default function CompanyStats({ levelDistribution, totalEntries }: CompanyStatsProps) {
  if (!levelDistribution || totalEntries === 0) return null

  // Sort levels by count descending, or by predefined order
  const entries = Object.entries(levelDistribution).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...entries.map(([, count]) => count))

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-colors duration-300">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
        <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
        Level Distribution
      </h3>
      <div className="space-y-5">
        {entries.map(([level, count]) => {
          const percentage = Math.round((count / maxCount) * 100)
          const share = Math.round((count / totalEntries) * 100)
          
          return (
            <div key={level} className="group">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">{level}</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium tabular-nums">{count} records <span className="text-slate-400 dark:text-slate-500">({share}%)</span></span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out group-hover:bg-indigo-400 relative overflow-hidden"
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
