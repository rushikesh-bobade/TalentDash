import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { calculateMedian, formatCurrency } from '@/lib/normalize'
import CompanyLogo from '@/components/CompanyLogo'

async function getStats() {
  const [totalRecords, companies, allSalaries] = await Promise.all([
    prisma.salary.count(),
    prisma.salary.findMany({ select: { company: true }, distinct: ['company'] }),
    prisma.salary.findMany({ select: { company: true, total_compensation: true } }),
  ])

  const companyMap: Record<string, number[]> = {}
  for (const s of allSalaries) {
    if (!companyMap[s.company]) companyMap[s.company] = []
    companyMap[s.company].push(s.total_compensation)
  }

  const topCompanies = Object.entries(companyMap)
    .map(([name, values]) => ({
      name,
      medianTC: calculateMedian(values),
      count: values.length,
    }))
    .sort((a, b) => b.medianTC - a.medianTC)
    .slice(0, 5)

  return {
    totalRecords,
    uniqueCompanies: companies.length,
    topCompanies,
  }
}

export default async function Home({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params
  const country = resolvedParams.country || 'in'

  const stats = await getStats()

  return (
    <div className="relative overflow-hidden">
      {/* HERO SECTION */}
      <div className="relative pt-24 pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-indigo-200/50 dark:bg-indigo-600/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] bg-blue-200/50 dark:bg-blue-600/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 dark:hidden" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-0 hidden dark:block" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 dark:via-slate-950/80 dark:to-slate-950" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md text-slate-600 dark:text-slate-300 text-sm font-bold uppercase tracking-widest mb-10 shadow-lg dark:shadow-2xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-900 dark:text-white font-black">{stats.totalRecords.toLocaleString()}</span> Verified Salaries
          </div>
          
          <h1 className="text-6xl sm:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-8">
            Empower Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400">
              Career Decisions
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
            Stop guessing your market worth. Discover accurate, level-based compensation data for top tech companies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              href={`/${country}/salaries`}
              className="w-full sm:w-auto px-10 py-5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 text-xl flex items-center justify-center gap-3 group"
            >
              Explore Salaries
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
            <Link
              href={`/${country}/compare`}
              className="w-full sm:w-auto px-10 py-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-900 dark:text-white font-black border border-slate-300/50 dark:border-slate-700/50 rounded-2xl transition-all shadow-lg dark:shadow-xl hover:-translate-y-1 text-xl flex items-center justify-center"
            >
              Compare Offers
            </Link>
          </div>
        </div>
      </div>

      {/* TRUST SIGNALS BANNER */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-10 overflow-hidden relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-10">Salaries from employees at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 transition-all duration-700">
            {[
              { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', h: 'h-8' },
              { name: 'Microsoft', url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', h: 'h-7' },
              { name: 'Amazon', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', h: 'h-8', class: 'translate-y-2' },
              { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', h: 'h-6' },
              { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', h: 'h-7' },
              { name: 'Apple', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', h: 'h-7', filter: 'dark:invert' },
            ].map(company => (
              <div key={company.name} className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105">
                <img 
                  src={company.url} 
                  alt={`${company.name} logo`} 
                  className={`object-contain ${company.h} ${company.class || ''} ${company.filter || ''}`} 
                  title={company.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-slate-50 dark:bg-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* STATS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-300">
              <div className="text-7xl font-black text-indigo-600 dark:text-indigo-400 mb-4 tabular-nums tracking-tighter">
                {stats.totalRecords.toLocaleString()}
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Verified Data Points</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-300">
              <div className="text-7xl font-black text-blue-500 dark:text-blue-400 mb-4 tabular-nums tracking-tighter">
                {stats.uniqueCompanies.toLocaleString()}
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Tech Companies</div>
            </div>
          </div>

          {/* TOP COMPANIES */}
          <div className="mb-32">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 px-2 gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">Top Paying Companies</h2>
                <p className="text-slate-500 font-medium">Explore compensation details at the industry leaders.</p>
              </div>
              <Link href={`/${country}/companies`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-3 rounded-xl transition-colors">
                View All Companies &rarr;
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {stats.topCompanies.map(company => (
                <Link
                  key={company.name}
                  href={`/${country}/companies/${company.name}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 p-8 rounded-3xl transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-2 relative overflow-hidden flex flex-col items-center text-center"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-900/20 to-blue-50/50 dark:to-blue-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-[2.5]" />
                  
                  <CompanyLogo name={company.name} size="lg" className="mb-6 relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  
                  <div className="font-black text-slate-900 dark:text-slate-100 mb-4 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-xl relative z-10">
                    {company.name}
                  </div>
                  
                  <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative z-10 mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Median TC
                    </div>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {formatCurrency(company.medianTC)}
                    </div>
                  </div>
                  
                  <div className="text-xs font-bold text-slate-400 relative z-10">
                    {company.count} records
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* TOOLS GRID */}
          <div>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">Free Career Tools</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Make data-driven decisions about your next career move with our suite of free compensation tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Benchmark */}
              <Link href={`/${country}/tools/benchmark`} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300">
                    🎯
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Am I Underpaid?</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Benchmark your current salary against verified market data for your role and location.</p>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
                    Check Now <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>

              {/* Hike Calc */}
              <Link href={`/${country}/tools/hike-calculator`} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300">
                    📈
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Hike Calculator</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Plan your next appraisal. Calculate your new CTC and estimated monthly in-hand salary.</p>
                  <div className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
                    Calculate <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>

              {/* TC Calc */}
              <Link href={`/${country}/tools/tc-calculator`} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-300">
                    🧮
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">TC Calculator</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Understand your true earning potential over 4 years with different RSU vesting schedules.</p>
                  <div className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-2">
                    Calculate TC <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
