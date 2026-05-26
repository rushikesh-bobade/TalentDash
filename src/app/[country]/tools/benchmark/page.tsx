'use client'

import React, { useState } from 'react'
import { calculatePercentile } from '@/lib/normalize'

interface SalaryData {
  company: string;
  role: string;
  level: string;
  total_compensation: number;
}

export default function BenchmarkPage({ params }: { params: Promise<{ country: string }> }) {
  const _ = React.use(params)

  const [role, setRole] = useState('Software Engineer')
  const [location, setLocation] = useState('Bangalore')
  const [currentCTC, setCurrentCTC] = useState(2000000)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<{
    percentile: number,
    median: number,
    p25: number,
    p75: number,
    count: number,
    delta: number
  } | null>(null)

  const handleBenchmark = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/salaries?role=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}&limit=100`)
      const json = await res.json()
      
      if (json.data && json.data.length > 0) {
        const comps = json.data.map((s: SalaryData) => s.total_compensation).sort((a: number, b: number) => a - b)
        const median = calculatePercentile(comps, 50)
        const p25 = calculatePercentile(comps, 25)
        const p75 = calculatePercentile(comps, 75)
        
        // Find percentile of currentCTC
        let pIndex = comps.findIndex((c: number) => c >= currentCTC)
        if (pIndex === -1) pIndex = comps.length
        const percentile = Math.round((pIndex / comps.length) * 100)

        setResults({
          percentile,
          median,
          p25,
          p75,
          count: json.meta.total,
          delta: currentCTC - median
        })
      } else {
        setResults(null)
      }
    } catch (err) {
      console.error(err)
      setResults(null)
    }
    setLoading(false)
    setHasSearched(true)
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-3xl mb-6">
          🎯
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          Am I Underpaid?
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Benchmark your salary against verified market data.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Role</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Location</label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Current CTC (Total)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={currentCTC}
                onChange={e => setCurrentCTC(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleBenchmark}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-colors text-lg"
        >
          {loading ? 'Analyzing Data...' : 'Benchmark My Salary'}
        </button>
      </div>

      {hasSearched && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {results ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                You earn more than <span className="text-indigo-600 dark:text-indigo-400">{results.percentile}%</span> of peers
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                Based on {results.count} verified salaries for {role} in {location}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your CTC</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{fmt(currentCTC)}</div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Market Median</div>
                  <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 tabular-nums">{fmt(results.median)}</div>
                </div>
                <div className={`${results.delta >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50'} p-4 rounded-xl border`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${results.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Difference</div>
                  <div className={`text-2xl font-black tabular-nums ${results.delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {results.delta >= 0 ? '+' : ''}{fmt(results.delta)}
                  </div>
                </div>
              </div>

              {/* Distribution Bar */}
              <div className="relative pt-6 pb-2">
                <div className="h-4 bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-full w-full" />
                
                {/* 25th / 75th markers (purely visual layout) */}
                <div className="absolute top-12 left-1/4 -translate-x-1/2 text-xs font-bold text-slate-400">P25</div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">Median</div>
                <div className="absolute top-12 left-3/4 -translate-x-1/2 text-xs font-bold text-slate-400">P75</div>

                {/* User Marker */}
                <div 
                  className="absolute top-4 -translate-y-1/2 -ml-2"
                  style={{ left: `${Math.max(0, Math.min(100, results.percentile))}%` }}
                >
                  <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900 shadow-md relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      You
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🤷‍♂️</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Not enough data</h3>
              <p className="text-slate-500 dark:text-slate-400">
                We couldn&apos;t find enough verified salaries for this exact combination to provide a reliable benchmark.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
