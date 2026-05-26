'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, titleCase } from '@/lib/normalize'
import CompanyLogo from '@/components/CompanyLogo'
import SalaryTable from '@/components/SalaryTable'
import type { SalaryRecord } from '@/types'

interface CompanyMeta {
  wlb: number
  career_growth: number
  benefits_value: number
  rsu_cliff_months: number
}

interface EnhancedCompareResponse {
  salary_a: SalaryRecord
  salary_b: SalaryRecord
  meta_a: CompanyMeta
  meta_b: CompanyMeta
  diff: {
    base: number
    bonus: number
    stock: number
    total: number
    experience: number
    level_difference: string
  }
}

function BestBadge() {
  return (
    <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
      Best
    </span>
  )
}

function ScoreBar({ value, max = 5, color = 'indigo' }: { value: number; max?: number; color?: string }) {
  const pct = (value / max) * 100
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color] || colorMap.indigo} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-black tabular-nums text-slate-900 dark:text-slate-100 w-8 text-right">{value}</span>
    </div>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const s1 = searchParams.get('s1')
  const s2 = searchParams.get('s2')

  const [compareData, setCompareData] = useState<EnhancedCompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [tableLoading, setTableLoading] = useState(false)

  useEffect(() => {
    if (s1 && s2) {
      setLoading(true)
      setAiSummary(null)
      fetch(`/api/compare?s1=${s1}&s2=${s2}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.message || data.error)
          else {
            setCompareData(data)
            // Fetch AI summary
            setAiLoading(true)
            fetch('/api/compare/ai-summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })
              .then(r => r.json())
              .then(r => setAiSummary(r.summary || null))
              .catch(() => setAiSummary(null))
              .finally(() => setAiLoading(false))
          }
        })
        .catch(() => setError('Failed to fetch comparison'))
        .finally(() => setLoading(false))
    } else {
      setCompareData(null)
      setError('')
      setTableLoading(true)
      fetch('/api/salaries?limit=50')
        .then(res => res.json())
        .then(data => setSalaries(data.data || []))
        .catch(console.error)
        .finally(() => setTableLoading(false))
    }
  }, [s1, s2])

  const handleSelectionChange = (ids: string[]) => setSelectedIds(ids)

  const handleCompareClick = () => {
    if (selectedIds.length === 2) {
      router.push(`/compare?s1=${selectedIds[0]}&s2=${selectedIds[1]}`)
    }
  }

  const clearComparison = () => {
    setSelectedIds([])
    router.push('/compare')
  }

  if (loading) return <div className="text-center py-32 text-indigo-600 font-bold animate-pulse text-lg tracking-tight">Computing comparison...</div>

  if (error) {
    return (
      <div className="text-center py-32">
        <div className="text-rose-600 font-bold text-xl mb-4">⚠️ {error}</div>
        <button onClick={clearComparison} className="text-indigo-600 font-bold hover:underline">
          Go back to selection
        </button>
      </div>
    )
  }

  if (compareData) {
    const { salary_a, salary_b, meta_a, meta_b, diff } = compareData

    // Determine winners for each metric
    const totalWinner = salary_a.total_compensation >= salary_b.total_compensation ? 'a' : 'b'
    const baseWinner = salary_a.base_salary >= salary_b.base_salary ? 'a' : 'b'
    const stockWinner = salary_a.stock >= salary_b.stock ? 'a' : 'b'
    const bonusWinner = salary_a.bonus >= salary_b.bonus ? 'a' : 'b'
    const wlbWinner = meta_a.wlb >= meta_b.wlb ? 'a' : 'b'
    const careerWinner = meta_a.career_growth >= meta_b.career_growth ? 'a' : 'b'
    const benefitsWinner = meta_a.benefits_value >= meta_b.benefits_value ? 'a' : 'b'

    const rows = [
      {
        label: 'Total Compensation',
        a: formatCurrency(salary_a.total_compensation),
        b: formatCurrency(salary_b.total_compensation),
        winner: totalWinner,
        highlight: true,
      },
      {
        label: 'Base Salary',
        a: formatCurrency(salary_a.base_salary),
        b: formatCurrency(salary_b.base_salary),
        winner: baseWinner,
      },
      {
        label: 'Annual RSU / Stock',
        a: salary_a.stock > 0 ? formatCurrency(salary_a.stock) : '—',
        b: salary_b.stock > 0 ? formatCurrency(salary_b.stock) : '—',
        winner: stockWinner,
      },
      {
        label: 'Target Bonus',
        a: salary_a.bonus > 0 ? formatCurrency(salary_a.bonus) : '—',
        b: salary_b.bonus > 0 ? formatCurrency(salary_b.bonus) : '—',
        winner: bonusWinner,
      },
    ]

    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <button onClick={clearComparison} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> New Comparison
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">Offer Breakdown</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Head-to-head structural comparison of total compensation.</p>
        </div>

        {/* Company Header Cards */}
        <div className="grid grid-cols-3 gap-0 mb-0">
          {/* Header A */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-2xl p-6 text-center">
            <CompanyLogo name={salary_a.company} size="lg" className="mx-auto mb-3" />
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 capitalize tracking-tight">{titleCase(salary_a.company)}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{salary_a.level}</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{salary_a.role}</div>
          </div>
          {/* Header Middle - VS */}
          <div className="bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <div className="bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg">VS</div>
          </div>
          {/* Header B */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tr-2xl p-6 text-center">
            <CompanyLogo name={salary_b.company} size="lg" className="mx-auto mb-3" />
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 capitalize tracking-tight">{titleCase(salary_b.company)}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{salary_b.level}</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{salary_b.role}</div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 overflow-hidden">
          {rows.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 ${row.highlight ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-950/50' : ''}`}>
              {/* Value A */}
              <div className="px-6 py-5 text-center border-r border-slate-100 dark:border-slate-800">
                <span className={`text-lg font-black tabular-nums ${row.highlight ? 'text-2xl' : ''} text-slate-900 dark:text-slate-100`}>
                  {row.a}
                </span>
                {row.winner === 'a' && row.a !== '—' && <BestBadge />}
              </div>
              {/* Label */}
              <div className="px-4 py-5 flex items-center justify-center text-center">
                <span className={`text-xs font-bold uppercase tracking-wider ${row.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {row.label}
                </span>
              </div>
              {/* Value B */}
              <div className="px-6 py-5 text-center border-l border-slate-100 dark:border-slate-800">
                <span className={`text-lg font-black tabular-nums ${row.highlight ? 'text-2xl' : ''} text-slate-900 dark:text-slate-100`}>
                  {row.b}
                </span>
                {row.winner === 'b' && row.b !== '—' && <BestBadge />}
              </div>
            </div>
          ))}

          {/* Divider */}
          <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700" />

          {/* WLB Score */}
          <div className="grid grid-cols-3 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="px-6 py-5 border-r border-slate-100 dark:border-slate-800">
              <ScoreBar value={meta_a.wlb} color={wlbWinner === 'a' ? 'emerald' : 'indigo'} />
              {wlbWinner === 'a' && <div className="text-center mt-1"><BestBadge /></div>}
            </div>
            <div className="px-4 py-5 flex items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">WLB Score</span>
            </div>
            <div className="px-6 py-5 border-l border-slate-100 dark:border-slate-800">
              <ScoreBar value={meta_b.wlb} color={wlbWinner === 'b' ? 'emerald' : 'indigo'} />
              {wlbWinner === 'b' && <div className="text-center mt-1"><BestBadge /></div>}
            </div>
          </div>

          {/* RSU Vest Cliff */}
          <div className="grid grid-cols-3">
            <div className="px-6 py-5 text-center border-r border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                {meta_a.rsu_cliff_months > 0 ? `${meta_a.rsu_cliff_months} months` : 'No RSU'}
              </span>
            </div>
            <div className="px-4 py-5 flex items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">RSU Vest Cliff</span>
            </div>
            <div className="px-6 py-5 text-center border-l border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                {meta_b.rsu_cliff_months > 0 ? `${meta_b.rsu_cliff_months} months` : 'No RSU'}
              </span>
            </div>
          </div>

          {/* Career Growth */}
          <div className="grid grid-cols-3 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="px-6 py-5 border-r border-slate-100 dark:border-slate-800">
              <ScoreBar value={meta_a.career_growth} color={careerWinner === 'a' ? 'emerald' : 'indigo'} />
              {careerWinner === 'a' && <div className="text-center mt-1"><BestBadge /></div>}
            </div>
            <div className="px-4 py-5 flex items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Career Growth</span>
            </div>
            <div className="px-6 py-5 border-l border-slate-100 dark:border-slate-800">
              <ScoreBar value={meta_b.career_growth} color={careerWinner === 'b' ? 'emerald' : 'indigo'} />
              {careerWinner === 'b' && <div className="text-center mt-1"><BestBadge /></div>}
            </div>
          </div>

          {/* Benefits Value */}
          <div className="grid grid-cols-3">
            <div className="px-6 py-5 text-center border-r border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">~{formatCurrency(meta_a.benefits_value)}</span>
              {benefitsWinner === 'a' && <BestBadge />}
            </div>
            <div className="px-4 py-5 flex items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Benefits Value</span>
            </div>
            <div className="px-6 py-5 text-center border-l border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">~{formatCurrency(meta_b.benefits_value)}</span>
              {benefitsWinner === 'b' && <BestBadge />}
            </div>
          </div>

          {/* Experience */}
          <div className="grid grid-cols-3 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="px-6 py-5 text-center border-r border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{salary_a.experience_years} yrs</span>
            </div>
            <div className="px-4 py-5 flex items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Experience</span>
            </div>
            <div className="px-6 py-5 text-center border-l border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{salary_b.experience_years} yrs</span>
            </div>
          </div>

          {/* Level Diff */}
          <div className="grid grid-cols-3">
            <div className="px-6 py-5 text-center border-r border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{salary_a.level}</span>
            </div>
            <div className="px-4 py-5 flex items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Level</span>
            </div>
            <div className="px-6 py-5 text-center border-l border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{salary_b.level}</span>
            </div>
          </div>
        </div>

        {/* Delta Summary Row */}
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-b-2xl px-6 py-4 grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'TC Diff', val: diff.total },
            { label: 'Base Diff', val: diff.base },
            { label: 'Stock Diff', val: diff.stock },
            { label: 'Bonus Diff', val: diff.bonus },
          ].map(d => (
            <div key={d.label}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">{d.label}</div>
              <div className="text-sm font-black tabular-nums">
                {d.val === 0 ? 'Same' : `${d.val > 0 ? '+' : ''}${formatCurrency(d.val)}`}
              </div>
            </div>
          ))}
        </div>

        {/* AI Smart Summary */}
        <div className="mt-10 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-900/20 dark:via-slate-900 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-violet-500 rounded-l-2xl" />
          <div className="flex items-start gap-4">
            <div className="text-3xl mt-0.5">🤖</div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-3">AI Smart Summary</h3>
              {aiLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Analyzing offers with AI...</span>
                </div>
              ) : aiSummary ? (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{aiSummary}</p>
              ) : (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {titleCase(salary_a.company)} offers {formatCurrency(salary_a.total_compensation)} total comp at {salary_a.level}, while {titleCase(salary_b.company)} offers {formatCurrency(salary_b.total_compensation)} at {salary_b.level}.
                  {' '}{totalWinner === 'a' ? titleCase(salary_a.company) : titleCase(salary_b.company)} leads on total compensation by {formatCurrency(Math.abs(diff.total))}.
                  {' '}{wlbWinner === 'a' ? titleCase(salary_a.company) : titleCase(salary_b.company)} scores higher on Work-Life Balance ({Math.max(meta_a.wlb, meta_b.wlb)}/5),
                  while {careerWinner === 'a' ? titleCase(salary_a.company) : titleCase(salary_b.company)} edges ahead on Career Growth ({Math.max(meta_a.career_growth, meta_b.career_growth)}/5).
                  {' '}If maximizing Year-1 liquidity is the priority, {totalWinner === 'a' ? titleCase(salary_a.company) : titleCase(salary_b.company)} is the clear winner.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm transition-colors duration-300">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">Compare Offers</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Select exactly two verified salary records to benchmark them side-by-side.</p>
        </div>
        <button
          onClick={handleCompareClick}
          disabled={selectedIds.length !== 2}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:border-slate-200 dark:disabled:border-slate-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none whitespace-nowrap"
        >
          Compare Selected ({selectedIds.length}/2)
        </button>
      </div>

      <SalaryTable
        data={salaries}
        loading={tableLoading}
        showPagination={false}
        showSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-indigo-600 font-bold animate-pulse text-lg tracking-tight">Loading comparison tool...</div>}>
      <CompareContent />
    </Suspense>
  )
}
