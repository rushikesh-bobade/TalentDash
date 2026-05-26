'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FilterBar, { Filters } from '@/components/FilterBar'
import SalaryTable from '@/components/SalaryTable'
import type { SalaryRecord, PaginationMeta } from '@/types'

function SalariesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<SalaryRecord[]>([])
  const [meta, setMeta] = useState<PaginationMeta>()
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<Filters>({
    company: searchParams.get('company') ?? '',
    role: searchParams.get('role') ?? '',
    level: searchParams.get('level') ?? '',
    location: searchParams.get('location') ?? '',
  })
  
  const [sortField, setSortField] = useState(searchParams.get('sort') ?? 'total_compensation')
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>((searchParams.get('order') as 'asc'|'desc') ?? 'desc')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.company) params.set('company', filters.company)
      if (filters.role) params.set('role', filters.role)
      if (filters.level) params.set('level', filters.level)
      if (filters.location) params.set('location', filters.location)
      params.set('sort', sortField)
      params.set('order', sortOrder)
      params.set('page', page.toString())

      // Sync URL
      router.replace(`?${params.toString()}`, { scroll: false })

      try {
        const res = await fetch(`/api/salaries?${params.toString()}`)
        if (res.ok) {
          const json = await res.json()
          setData(json.data)
          setMeta(json.meta)
        }
      } catch (err) {
        console.error('Failed to fetch salaries', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters, sortField, sortOrder, page, router])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">Salary Explorer</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Filter and analyze verified compensation data across the Indian tech industry. 
          Uncover true market rates.
        </p>
      </div>

      <div className="mb-8">
        <FilterBar filters={filters} onChange={handleFilterChange} />
      </div>

      <SalaryTable
        data={data}
        loading={loading}
        meta={meta}
        onPageChange={setPage}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      />
    </div>
  )
}

export default function SalariesPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading explorer...</div>}>
      <SalariesContent />
    </Suspense>
  )
}
