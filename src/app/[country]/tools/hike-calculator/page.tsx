'use client'

import React, { useState } from 'react'

export default function HikeCalculatorPage({ params }: { params: Promise<{ country: string }> }) {
  const _ = React.use(params)

  const [currentCTC, setCurrentCTC] = useState(1200000)
  const [hikePercent, setHikePercent] = useState(30)
  const [expectedBonus, setExpectedBonus] = useState(0)

  const newCTC = Math.round(currentCTC * (1 + hikePercent / 100) + expectedBonus)
  const absoluteIncrease = newCTC - currentCTC
  const monthlyInHand = Math.round((newCTC / 12) * 0.7)
  const oldMonthlyInHand = Math.round((currentCTC / 12) * 0.7)

  const hikeCategory =
    hikePercent > 50 ? { label: 'Top 5%', color: 'text-emerald-500', desc: 'Exceptional — you\'re among the highest earners in your cohort.' }
    : hikePercent > 30 ? { label: 'Top 15%', color: 'text-emerald-400', desc: 'Excellent — well above the industry average.' }
    : hikePercent > 20 ? { label: 'Top 30%', color: 'text-blue-500', desc: 'Good — above the industry median.' }
    : { label: 'Top 50%', color: 'text-amber-500', desc: 'Average — consider negotiating for more.' }

  const maxBar = Math.max(currentCTC, newCTC)

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-3xl mb-6">
          📈
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          Salary Hike Calculator
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
          Plan your next appraisal. See how your hike stacks up against the industry and estimate your new in-hand salary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6">Your Details</h2>

          {/* Current CTC */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
              Current CTC (Annual)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={currentCTC}
                onChange={e => setCurrentCTC(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              {fmt(currentCTC)} per year · {fmt(Math.round(currentCTC / 12))} / month
            </p>
          </div>

          {/* Hike % Slider */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
              Expected Hike
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={hikePercent}
                onChange={e => setHikePercent(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                style={{
                  background: `linear-gradient(to right, #4f46e5 ${hikePercent}%, #e2e8f0 ${hikePercent}%)`
                }}
              />
              <div className="min-w-[80px] text-center">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{hikePercent}%</span>
              </div>
            </div>
          </div>

          {/* Expected Bonus */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
              Joining/Retention Bonus (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={expectedBonus}
                onChange={e => setExpectedBonus(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Market Position */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Market Position:</span>
              <span className={`text-sm font-black ${hikeCategory.color}`}>{hikeCategory.label}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{hikeCategory.desc}</p>
          </div>
        </div>

        {/* Output Card */}
        <div className="space-y-6">
          {/* New CTC Summary */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Projected New CTC</div>
            <div className="text-4xl font-black tabular-nums mb-4">{fmt(newCTC)}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1">Absolute Increase</div>
                <div className="text-xl font-black tabular-nums">+{fmt(absoluteIncrease)}</div>
              </div>
              <div>
                <div className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1">New Monthly In-Hand</div>
                <div className="text-xl font-black tabular-nums">{fmt(monthlyInHand)}</div>
              </div>
            </div>
          </div>

          {/* Visual Comparison */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-6">CTC Comparison</h3>

            <div className="space-y-4">
              {/* Current CTC Bar */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Current CTC</span>
                  <span className="text-slate-900 dark:text-slate-100 tabular-nums">{fmt(currentCTC)}</span>
                </div>
                <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-slate-400 dark:bg-slate-600 rounded-lg transition-all duration-500"
                    style={{ width: `${(currentCTC / maxBar) * 100}%` }}
                  />
                </div>
              </div>

              {/* New CTC Bar */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-indigo-600 dark:text-indigo-400">New CTC</span>
                  <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">{fmt(newCTC)}</span>
                </div>
                <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg transition-all duration-500"
                    style={{ width: `${(newCTC / maxBar) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Monthly breakdown */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Monthly In-Hand Estimate</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400">Before</div>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">{fmt(oldMonthlyInHand)}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400">After</div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{fmt(monthlyInHand)}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400">Increase</div>
                  <div className="text-lg font-black text-emerald-500 tabular-nums">+{fmt(monthlyInHand - oldMonthlyInHand)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
