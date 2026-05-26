import { prisma } from '@/lib/prisma'
import { calculateMedian, formatCurrencyShort } from '@/lib/normalize'
import Link from 'next/link'

export const revalidate = 3600 // ISR: Cache for 1 hour

export default async function HeatmapPage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params
  const { country = 'in' } = resolvedParams

  // 1. Fetch all salaries
  const allSalaries = await prisma.salary.findMany({
    select: { role: true, location: true, total_compensation: true }
  })

  // 2. Identify top roles and top locations based on data volume
  const roleCounts: Record<string, number> = {}
  const locationCounts: Record<string, number> = {}

  allSalaries.forEach(s => {
    roleCounts[s.role] = (roleCounts[s.role] || 0) + 1
    // capitalize location for display
    const loc = s.location.charAt(0).toUpperCase() + s.location.slice(1)
    locationCounts[loc] = (locationCounts[loc] || 0) + 1
  })

  const topRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(e => e[0])

  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(e => e[0])

  // 3. Build Matrix Data
  // matrix[role][location] = { median, count }
  const matrix: Record<string, Record<string, { median: number, count: number }>> = {}
  let maxMedian = 0
  let minMedian = Infinity

  topRoles.forEach(role => {
    matrix[role] = {}
    topLocations.forEach(loc => {
      const matches = allSalaries.filter(s => 
        s.role === role && 
        s.location.toLowerCase() === loc.toLowerCase()
      ).map(s => s.total_compensation)
      
      const count = matches.length
      const median = count > 0 ? calculateMedian(matches) : 0
      matrix[role][loc] = { median, count }

      if (median > 0) {
        if (median > maxMedian) maxMedian = median
        if (median < minMedian) minMedian = median
      }
    })
  })

  if (minMedian === Infinity) minMedian = 0

  // 4. Color Intensity Helper
  const getHeatmapColor = (median: number) => {
    if (median === 0) return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
    // Normalize median between 0 and 1
    const normalized = (median - minMedian) / (maxMedian - minMedian || 1)
    
    if (normalized > 0.8) return 'bg-emerald-700 text-white font-bold shadow-sm'
    if (normalized > 0.6) return 'bg-emerald-600 text-white font-bold'
    if (normalized > 0.4) return 'bg-emerald-500 text-white'
    if (normalized > 0.2) return 'bg-emerald-400 text-emerald-950'
    if (normalized > 0.1) return 'bg-emerald-300 text-emerald-900'
    return 'bg-emerald-200 text-emerald-900'
  }

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Salary Heatmap Matrix
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-3xl">
          Visualizing median total compensation across the top tech roles and highest paying cities. 
          Darker green indicates a higher median salary for that specific intersection.
        </p>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
        <span>Lower Comp</span>
        <div className="flex">
          <div className="w-6 h-6 bg-emerald-200 rounded-l"></div>
          <div className="w-6 h-6 bg-emerald-400"></div>
          <div className="w-6 h-6 bg-emerald-600"></div>
          <div className="w-6 h-6 bg-emerald-700 rounded-r"></div>
        </div>
        <span>Higher Comp</span>
        <div className="ml-4 flex items-center gap-1">
          <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded"></div>
          <span>No Data</span>
        </div>
      </div>

      {/* The Matrix */}
      <div className="overflow-x-auto pb-8">
        <div className="inline-block min-w-full align-middle">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 w-48 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">
                    Role \ Location
                  </th>
                  {topLocations.map(loc => (
                    <th key={loc} scope="col" className="px-4 py-4 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                      <Link href={`/${country}/salaries/location/${loc.toLowerCase()}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {loc}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {topRoles.map(role => (
                  <tr key={role} className="group">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">
                      <Link href={`/${country}/salaries/title/${role.replace(/ /g, '-').toLowerCase()}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {role}
                      </Link>
                    </td>
                    {topLocations.map(loc => {
                      const cell = matrix[role][loc]
                      return (
                        <td key={`${role}-${loc}`} className="p-1 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                          <div 
                            className={`w-full h-16 rounded-md flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md cursor-default ${getHeatmapColor(cell.median)}`}
                            title={`${role} in ${loc}\nMedian: ₹${cell.median.toLocaleString('en-IN')}\nData points: ${cell.count}`}
                          >
                            {cell.median > 0 ? (
                              <>
                                <span>{formatCurrencyShort(cell.median)}</span>
                                <span className="text-[10px] opacity-75 mt-0.5">{cell.count} val{cell.count > 1 ? 's' : ''}</span>
                              </>
                            ) : (
                              <span className="text-xs">-</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
