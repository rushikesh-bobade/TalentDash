'use client'
import { useEffect, useRef, useState } from 'react'
import { VALID_LEVELS } from '@/lib/validators'

export interface Filters {
  company: string
  role: string
  level: string
  location: string
}

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [localCompany, setLocalCompany] = useState(filters.company)
  const [localRole, setLocalRole] = useState(filters.role)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    if (filters.company !== localCompany || filters.role !== localRole) {
      debounceRef.current = setTimeout(() => {
        onChange({ ...filters, company: localCompany, role: localRole })
      }, 300)
    }
    
    return () => clearTimeout(debounceRef.current)
  }, [localCompany, localRole, filters, onChange])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden transition-colors duration-300">
      {/* Decorative subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Company</label>
          <input
            type="text"
            placeholder="e.g. Google"
            value={localCompany}
            onChange={e => setLocalCompany(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Role</label>
          <input
            type="text"
            placeholder="e.g. Software Engineer"
            value={localRole}
            onChange={e => setLocalRole(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Level</label>
          <select
            value={filters.level}
            onChange={e => onChange({ ...filters, level: e.target.value })}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors cursor-pointer appearance-none"
          >
            <option value="">All Levels</option>
            {VALID_LEVELS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Bangalore"
              value={filters.location}
              onChange={e => onChange({ ...filters, location: e.target.value })}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
            <button
              onClick={() => {
                setLocalCompany('')
                setLocalRole('')
                onChange({ company: '', role: '', level: '', location: '' })
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
