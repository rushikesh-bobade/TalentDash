import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { titleCase, formatCurrency, calculateMedian } from '@/lib/normalize'
import SalaryTable from '@/components/SalaryTable'

export const revalidate = 3600 // ISR: Cache for 1 hour

export default async function RoleSalariesPage({ params }: { params: Promise<{ country: string, role: string }> }) {
  const resolvedParams = await params
  const { country = 'in', role } = resolvedParams
  
  // Convert URL slug 'software-engineer' back to 'software engineer'
  const normalizedRole = role.replace(/-/g, ' ')
  
  const salaries = await prisma.salary.findMany({
    where: { role: { equals: normalizedRole, mode: 'insensitive' } },
    orderBy: { total_compensation: 'desc' },
  })

  if (salaries.length === 0) notFound()

  // Calculate overall metrics
  const comps = salaries.map(s => s.total_compensation)
  const medianTC = calculateMedian(comps)
  
  // Averages for breakdown
  const avgBase = salaries.reduce((sum, s) => sum + s.base_salary, 0) / salaries.length
  const avgStock = salaries.reduce((sum, s) => sum + s.stock, 0) / salaries.length
  const avgBonus = salaries.reduce((sum, s) => sum + s.bonus, 0) / salaries.length
  
  // Top Companies for this role
  const companyMap: Record<string, number[]> = {}
  salaries.forEach(s => {
    if (!companyMap[s.company]) companyMap[s.company] = []
    companyMap[s.company].push(s.total_compensation)
  })
  
  const topCompanies = Object.entries(companyMap)
    .map(([company, comps]) => ({ company, median: calculateMedian(comps), count: comps.length }))
    .filter(c => c.count >= 1) // can increase threshold if more data
    .sort((a, b) => b.median - a.median)
    .slice(0, 3)

  const mappedSalaries = salaries.map(s => ({
    ...s,
    level: s.level.replace(/_/g, '-')
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/${country}/salaries`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to All Salaries
      </Link>
      
      {/* Hero Section */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 capitalize tracking-tight mb-4">
          {titleCase(normalizedRole)} Salary
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl">
          Based on {salaries.length} verified salaries across India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Median Stats Box */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Median Total Compensation</div>
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums mb-8">
            {formatCurrency(medianTC)}
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300">Base Salary</span>
                <span className="text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(avgBase)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(avgBase / (avgBase + avgStock + avgBonus)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300">Stock (RSU)</span>
                <span className="text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(avgStock)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(avgStock / (avgBase + avgStock + avgBonus)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span className="text-slate-600 dark:text-slate-300">Bonus</span>
                <span className="text-slate-900 dark:text-slate-100 tabular-nums">{formatCurrency(avgBonus)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(avgBonus / (avgBase + avgStock + avgBonus)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Companies Sidebar */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-6">Top Paying Companies</h3>
          <div className="space-y-4">
            {topCompanies.map((tc, idx) => (
              <Link 
                key={tc.company} 
                href={`/${country}/companies/${tc.company}`}
                className="block p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-bold text-slate-400">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 dark:text-slate-100 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tc.company}
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                      {formatCurrency(tc.median)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          Explorer Salaries
        </h2>
      </div>

      <SalaryTable data={mappedSalaries} showPagination={true} />
    </div>
  )
}
