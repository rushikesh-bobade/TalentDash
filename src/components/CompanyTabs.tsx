'use client'

import { useState } from 'react'
import SalaryTable from './SalaryTable'

interface TabSalary {
  id: string
  company: string
  role: string
  level: string
  location: string
  experience_years: number
  base_salary: number
  bonus: number
  stock: number
  total_compensation: number
  confidence_score: number
  created_at: Date
}

interface TabReview {
  id: string
  rating_overall: number
  rating_wlb: number
  rating_culture: number
  rating_comp: number
  pros: string
  cons: string
  advice: string | null
}

interface TabInterview {
  id: string
  role: string
  process_duration: number
  difficulty: number
  offer_status: string
  questions: string[]
  experience: string | null
}

export default function CompanyTabs({
  salaries,
  reviews,
  interviews,
}: {
  salaries: TabSalary[]
  reviews: TabReview[]
  interviews: TabInterview[]
}) {
  const [activeTab, setActiveTab] = useState<'salaries' | 'reviews' | 'interviews'>('salaries')

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('salaries')}
          className={`py-3 px-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'salaries'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Salaries ({salaries.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`py-3 px-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'interviews'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Interviews ({interviews.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'salaries' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SalaryTable data={salaries} showPagination={false} />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Your Anonymous Safe Space</h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                  All reviews are 100% anonymous. We do not track IPs or require accounts. Honest conversations about culture and work-life balance happen here.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No reviews yet. Be the first to anonymously share your experience.</p>
            ) : (
              <div className="grid gap-4">
                {reviews.map((r: TabReview) => (
                  <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                    <div className="flex gap-2 items-center mb-4">
                      <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">
                        {r.rating_overall} / 5 Overall
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        WLB: {r.rating_wlb} • Culture: {r.rating_culture} • Comp: {r.rating_comp}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pros</h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{r.pros}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cons</h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{r.cons}</p>
                      </div>
                    </div>
                    {r.advice && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Advice to Management</h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{r.advice}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {interviews.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No interviews yet. Share your interview experience.</p>
            ) : (
              <div className="grid gap-4">
                {interviews.map((i: TabInterview) => (
                  <div key={i.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{i.role} Interview</h4>
                        <p className="text-xs text-slate-500 mt-1">Duration: {i.process_duration} days</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded">
                          Diff: {i.difficulty}/5
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          i.offer_status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          i.offer_status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {i.offer_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    {i.questions.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Questions Asked</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {i.questions.map((q: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {i.experience && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Experience</h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{i.experience}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
