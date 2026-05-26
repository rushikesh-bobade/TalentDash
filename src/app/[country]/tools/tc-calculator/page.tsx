'use client'

import React, { useState } from 'react'

export default function TCCalculatorPage({ params }: { params: Promise<{ country: string }> }) {
  const _ = React.use(params)

  const [baseSalary, setBaseSalary] = useState(2500000)
  const [bonus, setBonus] = useState(200000)
  const [stockGrant, setStockGrant] = useState(5000000)
  const [schedule, setSchedule] = useState('even')

  const years = [1, 2, 3, 4]

  const getVestingPct = (year: number) => {
    if (schedule === 'even') return 0.25
    if (schedule === 'amazon') {
      if (year === 1) return 0.05
      if (year === 2) return 0.15
      if (year === 3) return 0.40
      if (year === 4) return 0.40
    }
    return 0.25
  }

  const breakdown = years.map(year => {
    const vestedStock = stockGrant * getVestingPct(year)
    const total = baseSalary + bonus + vestedStock
    return { year, base: baseSalary, bonus, stock: vestedStock, total }
  })

  const total4Years = breakdown.reduce((sum, y) => sum + y.total, 0)
  const maxYearTotal = Math.max(...breakdown.map(y => y.total))

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-3xl mb-6">
          🧮
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          Total Compensation Calculator
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
          Understand your true earning potential over 4 years with different RSU vesting schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6">Offer Details</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Base Salary</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={e => setBaseSalary(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Target Bonus / Sign-on</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={bonus}
                  onChange={e => setBonus(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Total Stock Grant (4-year)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={stockGrant}
                  onChange={e => setStockGrant(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Vesting Schedule</label>
              <select
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="even">Standard 4-Year (25% / 25% / 25% / 25%)</option>
                <option value="amazon">Amazon Style (5% / 15% / 40% / 40%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-indigo-600 dark:bg-indigo-900/50 rounded-2xl p-6 text-white shadow-md flex items-center justify-between border border-indigo-500 dark:border-indigo-800">
            <div>
              <div className="text-indigo-200 font-bold text-sm uppercase tracking-wider mb-1">Total 4-Year Earnings</div>
              <div className="text-4xl font-black tabular-nums">{fmt(total4Years)}</div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-indigo-200 font-bold text-sm uppercase tracking-wider mb-1">Average per year</div>
              <div className="text-xl font-bold tabular-nums">{fmt(Math.round(total4Years / 4))}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-6">4-Year Projection</h3>
            
            <div className="space-y-6">
              {breakdown.map(y => (
                <div key={y.year}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">Year {y.year}</span>
                    <span className="text-slate-900 dark:text-slate-100 tabular-nums">{fmt(y.total)}</span>
                  </div>
                  
                  <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex transition-all duration-500" style={{ width: `${(y.total / maxYearTotal) * 100}%` }}>
                    <div className="h-full bg-blue-500" style={{ width: `${(y.base / y.total) * 100}%` }} title={`Base: ${fmt(y.base)}`} />
                    <div className="h-full bg-emerald-500" style={{ width: `${(y.bonus / y.total) * 100}%` }} title={`Bonus: ${fmt(y.bonus)}`} />
                    <div className="h-full bg-purple-500" style={{ width: `${(y.stock / y.total) * 100}%` }} title={`Stock: ${fmt(y.stock)}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider justify-center">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /> Base</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Bonus</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500" /> Stock</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
