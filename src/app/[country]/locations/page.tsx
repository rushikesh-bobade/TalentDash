import { prisma } from '@/lib/prisma'
import { formatCurrency, calculateMedian } from '@/lib/normalize'
import Link from 'next/link'

export const revalidate = 3600

export default async function LocationsPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params

  const salaries = await prisma.salary.findMany({
    select: { location: true, total_compensation: true, company: true, role: true },
  })

  // Group by location
  const grouped = salaries.reduce((acc, s) => {
    if (!acc[s.location]) acc[s.location] = []
    acc[s.location].push(s)
    return acc
  }, {} as Record<string, typeof salaries>)

  const locationCards = Object.entries(grouped)
    .map(([location, records]) => {
      const comps = records.map(r => r.total_compensation)
      const companies = [...new Set(records.map(r => r.company))]
      const roles = [...new Set(records.map(r => r.role))]
      return {
        location,
        count: records.length,
        medianTC: calculateMedian(comps),
        minTC: Math.min(...comps),
        maxTC: Math.max(...comps),
        companiesCount: companies.length,
        rolesCount: roles.length,
        topCompanies: companies.slice(0, 4),
      }
    })
    .sort((a, b) => b.medianTC - a.medianTC)

  const locationEmoji: Record<string, string> = {
    'Bangalore': '🏙️',
    'Mumbai': '🌊',
    'Delhi': '🏛️',
    'Hyderabad': '🕌',
    'Pune': '⛰️',
    'Chennai': '🛕',
    'Gurgaon': '🏗️',
    'Remote': '🏠',
  }

  const topMedian = locationCards[0]?.medianTC || 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/${country}/salaries`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Salaries
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Salaries by Location
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Compare tech compensation across {locationCards.length} cities. See where the highest-paying tech jobs are concentrated.
        </p>
      </div>

      {/* Location Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Compensation Leaderboard</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {locationCards.map((lc, idx) => (
            <Link
              key={lc.location}
              href={`/${country}/salaries/location/${encodeURIComponent(lc.location.toLowerCase())}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className="w-8 text-center">
                <span className={`text-lg font-black ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-400'}`}>
                  {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl">{locationEmoji[lc.location] || '📍'}</span>
                <div className="min-w-0">
                  <div className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {lc.location}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {lc.companiesCount} companies · {lc.count} records
                  </div>
                </div>
              </div>

              {/* Bar */}
              <div className="hidden sm:flex items-center gap-3 flex-1">
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${(lc.medianTC / topMedian) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-right min-w-[100px]">
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {formatCurrency(lc.medianTC)}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median TC</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Location Directory Grid */}
      <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-16">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-8">
          Location Directory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* South India */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">South India</h3>
            <div className="flex flex-col gap-2">
              {['Bangalore', 'Hyderabad', 'Chennai'].map(city => {
                const lc = locationCards.find(l => l.location === city)
                if (!lc) return null
                return (
                  <Link key={city} href={`/${country}/salaries/location/${city.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group">
                    <span className="text-xl">🇮🇳</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{city}, IN</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* West India */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">West India</h3>
            <div className="flex flex-col gap-2">
              {['Mumbai', 'Pune'].map(city => {
                const lc = locationCards.find(l => l.location === city)
                if (!lc) return null
                return (
                  <Link key={city} href={`/${country}/salaries/location/${city.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group">
                    <span className="text-xl">🇮🇳</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{city}, IN</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* North India */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">North India</h3>
            <div className="flex flex-col gap-2">
              {['Delhi', 'Gurgaon'].map(city => {
                const lc = locationCards.find(l => l.location === city)
                if (!lc) return null
                return (
                  <Link key={city} href={`/${country}/salaries/location/${city.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group">
                    <span className="text-xl">🇮🇳</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{city}, IN</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Remote / Other */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Other</h3>
            <div className="flex flex-col gap-2">
              {['Remote'].map(city => {
                const lc = locationCards.find(l => l.location === city)
                if (!lc) return null
                return (
                  <Link key={city} href={`/${country}/salaries/location/${city.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group">
                    <span className="text-xl">🌐</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{city}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
