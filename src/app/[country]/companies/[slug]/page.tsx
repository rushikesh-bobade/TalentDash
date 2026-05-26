import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency, titleCase, calculatePercentile } from '@/lib/normalize'
import CompanyTabs from '@/components/CompanyTabs'
import CompanyStats from '@/components/CompanyStats'
import CompanyLogo from '@/components/CompanyLogo'
import { getCompanyInsights } from '@/lib/groq'

export async function generateStaticParams() {
  try {
    const companies = await prisma.salary.findMany({
      select: { company: true },
      distinct: ['company'],
    })
    return companies.map((c) => ({
      slug: c.company,
    }))
  } catch (err) {
    console.error('Prisma generateStaticParams error:', err)
    return []
  }
}

export const revalidate = 3600 // ISR: revalidate every hour

async function getCompanyData(slug: string) {
  const res = await fetch(`http://localhost:3000/api/companies/${slug}`, {
    next: { revalidate: 3600 }
  }).catch(() => null)
  
  if (!res || !res.ok) {
    const salaries = await prisma.salary.findMany({
      where: { company: { contains: slug } },
      orderBy: { total_compensation: 'desc' },
    })
    const mappedSalaries = salaries.map(s => ({
      ...s,
      level: s.level.replace(/_/g, '-')
    }))

    if (mappedSalaries.length === 0) return null

    const sorted = [...mappedSalaries].map(s => s.total_compensation).sort((a,b)=>a-b)
    const mid = Math.floor(sorted.length/2)
    const median_compensation = sorted.length % 2 === 0 ? (sorted[mid-1]+sorted[mid])/2 : sorted[mid]
    
    const level_distribution = mappedSalaries.reduce((acc, s) => {
      acc[s.level] = (acc[s.level] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { company: slug, salaries: mappedSalaries, median_compensation, level_distribution, total_entries: mappedSalaries.length }
  }

  return res.json()
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string, country: string }> }) {
  const resolvedParams = await params
  const country = resolvedParams.country || 'in'
  const data = await getCompanyData(resolvedParams.slug)
  if (!data) notFound()

  // Fetch AI Insights concurrently if possible, or await it
  const aiInsight = await getCompanyInsights(data.company)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: titleCase(data.company),
    url: `https://talentdash.com/companies/${data.company}`,
    sameAs: [`https://www.google.com/search?q=${data.company}`],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: data.total_entries.toString()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/${country}/salaries`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Salaries
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <CompanyLogo name={data.company} size="xl" />
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 capitalize tracking-tight mb-2">{titleCase(data.company)}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Verified Compensation Intelligence Report</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-w-[300px] shadow-sm relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 dark:from-indigo-900/30 to-blue-50 dark:to-blue-900/30 rounded-bl-full -mr-8 -mt-8" />
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10">Median Total Compensation</div>
          <div className="text-4xl font-black tabular-nums text-indigo-600 dark:text-indigo-400 mb-2 relative z-10 tracking-tight">
            {formatCurrency(data.median_compensation)}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-500 relative z-10">Based on {data.total_entries} verified employee records</div>
        </div>
      </div>

      {aiInsight && (
        <div className="mb-12 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div className="flex items-start gap-4">
            <div className="text-2xl mt-1">✨</div>
            <div>
              <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2">AI Insights Powered by Groq</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {aiInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <CompanyStats levelDistribution={data.level_distribution} totalEntries={data.total_entries} />
        </div>
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-colors duration-300">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase tracking-wider">Salary Distribution</h3>
          
          {(() => {
            const tcValues = data.salaries.map((s: { total_compensation: number }) => s.total_compensation)
            const p10 = calculatePercentile(tcValues, 10)
            const p25 = calculatePercentile(tcValues, 25)
            const p50 = calculatePercentile(tcValues, 50)
            const p75 = calculatePercentile(tcValues, 75)
            const p90 = calculatePercentile(tcValues, 90)
            const min = Math.min(...tcValues)
            const max = Math.max(...tcValues)
            const range = max - min || 1

            const toPercent = (val: number) => ((val - min) / range) * 100

            return (
              <div className="space-y-8">
                {/* Boxplot Visualization */}
                <div className="relative h-16 mx-4">
                  {/* Background track */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  
                  {/* P10-P90 whisker line */}
                  <div
                    className="absolute top-[22px] h-[10px] border-l-2 border-r-2 border-slate-400 dark:border-slate-500"
                    style={{ left: `${toPercent(p10)}%`, right: `${100 - toPercent(p90)}%` }}
                  >
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-400 dark:bg-slate-500" />
                  </div>

                  {/* P25-P75 box (IQR) */}
                  <div
                    className="absolute top-3 h-7 bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-500 dark:border-indigo-400 rounded-md"
                    style={{ left: `${toPercent(p25)}%`, right: `${100 - toPercent(p75)}%` }}
                  />

                  {/* Median line */}
                  <div
                    className="absolute top-2 h-9 w-0.5 bg-indigo-700 dark:bg-indigo-300 z-10 rounded-full"
                    style={{ left: `${toPercent(p50)}%` }}
                  />
                </div>

                {/* Percentile Labels */}
                <div className="grid grid-cols-5 text-center gap-1">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">P10</div>
                    <div className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(p10)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">P25</div>
                    <div className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(p25)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Median</div>
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{formatCurrency(p50)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">P75</div>
                    <div className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(p75)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">P90</div>
                    <div className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(p90)}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  50% of employees earn between {formatCurrency(p25)} and {formatCurrency(p75)}. The median is {formatCurrency(p50)}.
                </p>
              </div>
            )
          })()}
        </div>
      </div>

      <div>
        <CompanyTabs 
          salaries={data.salaries} 
          reviews={data.reviews || []} 
          interviews={data.interviews || []} 
        />
      </div>
    </div>
  )
}
