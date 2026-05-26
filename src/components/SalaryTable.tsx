'use client'

import { formatCurrency, titleCase } from '@/lib/normalize'
import LevelBadge from './LevelBadge'
import type { SalaryRecord, PaginationMeta } from '@/types'

interface SalaryTableProps {
  data: SalaryRecord[]
  loading?: boolean
  meta?: PaginationMeta
  onPageChange?: (page: number) => void
  onSort?: (field: string) => void
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  showPagination?: boolean
  showSelection?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

export default function SalaryTable({
  data,
  loading,
  meta,
  onPageChange,
  onSort,
  sortField,
  sortOrder,
  showSelection,
  selectedIds = [],
  onSelectionChange,
}: SalaryTableProps) {
  const toggleSelection = (id: string) => {
    if (!onSelectionChange) return
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(x => x !== id))
    } else {
      if (selectedIds.length < 2) onSelectionChange([...selectedIds, id])
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 ml-1">↕</span>
    return <span className="text-indigo-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm sticky top-0">
            <tr>
              {showSelection && <th className="px-4 py-3 w-10"></th>}
              <th className="px-4 py-3 font-bold tracking-wider">Company & Role</th>
              <th className="px-4 py-3 font-bold tracking-wider">Level</th>
              <th className="px-4 py-3 font-bold tracking-wider" onClick={() => onSort?.('experience_years')}>
                Exp {renderSortIcon('experience_years')}
              </th>
              <th className="px-4 py-3 font-bold tracking-wider" onClick={() => onSort?.('base_salary')}>
                Base {renderSortIcon('base_salary')}
              </th>
              <th className="px-4 py-3 font-bold tracking-wider">Bonus / Stock</th>
              <th className="px-4 py-3 font-bold tracking-wider" onClick={() => onSort?.('total_compensation')}>
                Total Comp {renderSortIcon('total_compensation')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-white dark:bg-slate-900 transition-colors duration-300">
                  {showSelection && <td className="p-4"><div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>}
                  <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-2" /><div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-24" /></td>
                  <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" /></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-8" /></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>
                  <td className="p-4"><div className="h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded w-20" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={showSelection ? 7 : 6} className="px-4 py-16 text-center text-slate-500 dark:text-slate-400 font-medium">
                  No salary records found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              data.map(row => {
                const isSelected = selectedIds.includes(row.id)
                const isDisabled = !isSelected && selectedIds.length >= 2

                return (
                  <tr 
                    key={row.id} 
                    className={`group transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    onClick={() => showSelection && !isDisabled && toggleSelection(row.id)}
                  >
                    {showSelection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => toggleSelection(row.id)}
                          className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{titleCase(row.company)}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">{row.role} • {row.location}</div>
                    </td>
                    <td className="px-4 py-3">
                      <LevelBadge level={row.level} />
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium tabular-nums">
                      {row.experience_years} y
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 tabular-nums font-medium">
                      {formatCurrency(row.base_salary)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-600 dark:text-slate-400 text-xs tabular-nums font-medium">
                        B: {row.bonus > 0 ? formatCurrency(row.bonus) : '-'}
                      </div>
                      <div className="text-slate-500 dark:text-slate-500 text-xs tabular-nums font-medium mt-0.5">
                        S: {row.stock > 0 ? formatCurrency(row.stock) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 tabular-nums">
                        {formatCurrency(row.total_compensation)}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-900 dark:text-slate-100">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-bold text-slate-900 dark:text-slate-100">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{meta.total}</span> records
          </div>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => onPageChange?.(meta.page - 1)}
              className="px-3 py-1.5 text-sm font-semibold rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
            >
              Previous
            </button>
            <button
              disabled={meta.page >= meta.pages}
              onClick={() => onPageChange?.(meta.page + 1)}
              className="px-3 py-1.5 text-sm font-semibold rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
