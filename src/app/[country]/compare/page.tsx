'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency, titleCase } from '@/lib/normalize'
import SalaryTable from '@/components/SalaryTable'
import type { SalaryRecord, CompareResponse } from '@/types'

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const s1 = searchParams.get('s1')
  const s2 = searchParams.get('s2')

  const [compareData, setCompareData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [tableLoading, setTableLoading] = useState(false)

  useEffect(() => {
    if (s1 && s2) {
      setLoading(true)
      fetch(`/api/compare?s1=${s1}&s2=${s2}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.message || data.error)
          else setCompareData(data)
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

  const renderDelta = (val: number, isCurrency = true) => {
    if (val === 0) return <span className="text-slate-400 font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">Same</span>
    const isPositive = val > 0
    const colorClass = isPositive ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800'
    const sign = isPositive ? '+' : '-'
    const formatted = isCurrency ? formatCurrency(Math.abs(val)) : Math.abs(val)
    return <span className={`${colorClass} font-bold tabular-nums text-sm px-3 py-1 rounded-full border`}>{sign}{formatted}</span>
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
    const { salary_a, salary_b, diff } = compareData
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <button onClick={clearComparison} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mb-8 inline-flex items-center gap-1 group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> New Comparison
        </button>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">Offer Breakdown</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Head-to-head structural comparison of total compensation.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card A */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-slate-200 dark:border-slate-800">Option A</div>
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-xl font-black text-slate-400 capitalize mb-4">
              {salary_a.company.charAt(0)}
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 capitalize tracking-tight mb-1">{titleCase(salary_a.company)}</div>
            <div className="text-slate-500 dark:text-slate-400 font-medium mb-8 flex items-center gap-2">
              <span className="text-slate-900 dark:text-slate-100 font-bold">{salary_a.role}</span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{salary_a.level}</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-6 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/30 transition-colors">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Compensation</div>
              <div className="text-4xl font-black tabular-nums text-slate-900 dark:text-slate-100 tracking-tight">{formatCurrency(salary_a.total_compensation)}</div>
            </div>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-slate-500 dark:text-slate-400">Base Salary</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{formatCurrency(salary_a.base_salary)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-slate-500 dark:text-slate-400">Bonus Component</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{salary_a.bonus > 0 ? formatCurrency(salary_a.bonus) : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Stock (RSU/ESOP)</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{salary_a.stock > 0 ? formatCurrency(salary_a.stock) : '—'}</span>
              </div>
            </div>
          </div>

          {/* Delta Column */}
          <div className="md:col-span-2 flex flex-col items-center justify-center py-8">
            <div className="bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-md mb-8">
              A vs B
            </div>
            
            <div className="flex flex-col items-center gap-6 text-center w-full">
              <div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Diff</div>
                {renderDelta(diff.total)}
              </div>
              
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              
              <div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Base Diff</div>
                {renderDelta(diff.base)}
              </div>
              
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              
              <div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Level Diff</div>
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {diff.level_difference}
                </div>
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-slate-200 dark:border-slate-800">Option B</div>
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-xl font-black text-slate-400 capitalize mb-4">
              {salary_b.company.charAt(0)}
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 capitalize tracking-tight mb-1">{titleCase(salary_b.company)}</div>
            <div className="text-slate-500 dark:text-slate-400 font-medium mb-8 flex items-center gap-2">
              <span className="text-slate-900 dark:text-slate-100 font-bold">{salary_b.role}</span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{salary_b.level}</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 mb-6 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/30 transition-colors">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Compensation</div>
              <div className="text-4xl font-black tabular-nums text-slate-900 dark:text-slate-100 tracking-tight">{formatCurrency(salary_b.total_compensation)}</div>
            </div>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-slate-500 dark:text-slate-400">Base Salary</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{formatCurrency(salary_b.base_salary)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-slate-500 dark:text-slate-400">Bonus Component</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{salary_b.bonus > 0 ? formatCurrency(salary_b.bonus) : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Stock (RSU/ESOP)</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{salary_b.stock > 0 ? formatCurrency(salary_b.stock) : '—'}</span>
              </div>
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
