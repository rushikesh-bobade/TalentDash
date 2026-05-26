import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { titleCase } from '@/lib/normalize'
import SalaryTable from '@/components/SalaryTable'

export const revalidate = 3600 // ISR: Cache for 1 hour

export default async function CitySalariesPage({ params }: { params: Promise<{ country: string, city: string }> }) {
  const resolvedParams = await params
  const { country = 'in', city } = resolvedParams
  
  // Convert URL slug 'bangalore' back to 'bangalore' or handle spaces if needed
  const normalizedCity = city.replace(/-/g, ' ')
  
  const salaries = await prisma.salary.findMany({
    where: { location: { equals: normalizedCity, mode: 'insensitive' } },
    orderBy: { total_compensation: 'desc' },
  })

  if (salaries.length === 0) notFound()

  const mappedSalaries = salaries.map(s => ({
    ...s,
    level: s.level.replace(/_/g, '-')
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/${country}/salaries`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 inline-flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to All Salaries
      </Link>
      
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 capitalize tracking-tight mb-2">
          Salaries in {titleCase(normalizedCity)}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
          Verified tech compensation data for companies located in {titleCase(normalizedCity)}.
        </p>
      </div>

      <SalaryTable data={mappedSalaries} showPagination={true} />
    </div>
  )
}
