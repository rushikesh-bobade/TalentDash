import { prisma } from '@/lib/prisma';
import { formatCurrency, titleCase, calculateMedian } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import CompanyLogo from '@/components/CompanyLogo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Companies',
  description: 'Explore compensation data across top tech companies in India',
};

interface CompanySummary {
  name: string;
  slug: string;
  recordCount: number;
  medianTC: number;
}

async function getCompanies(): Promise<CompanySummary[]> {
  const salaries = await prisma.salary.findMany({
    select: {
      company: true,
      total_compensation: true,
    },
  });

  // Group by company
  const grouped = new Map<string, number[]>();
  for (const s of salaries) {
    const key = s.company.toLowerCase().trim();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(s.total_compensation);
  }

  const companies: CompanySummary[] = [];
  for (const [name, tcs] of grouped) {
    companies.push({
      name,
      slug: name.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      recordCount: tcs.length,
      medianTC: calculateMedian(tcs),
    });
  }

  // Sort by record count descending
  companies.sort((a, b) => b.recordCount - a.recordCount);
  return companies;
}

export default async function CompaniesPage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params
  const country = resolvedParams.country || 'in'
  const companies = await getCompanies();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Companies
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Explore compensation data across {companies.length} companies in India
        </p>
      </div>

      {/* Grid */}
      {companies.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">No companies yet</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Compensation data will appear here once salaries are ingested.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/${country}/companies/${company.slug}`}
              className="group border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/50 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <CompanyLogo name={company.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {titleCase(company.name)}
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {company.recordCount.toLocaleString('en-IN')} {company.recordCount === 1 ? 'record' : 'records'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Median TC
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(company.medianTC)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
