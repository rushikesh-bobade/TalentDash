export interface SalaryRecord {
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
  created_at: string | Date
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface SalariesResponse {
  data: SalaryRecord[]
  meta: PaginationMeta
}

export interface CompanyStatsResponse {
  company: string
  salaries: SalaryRecord[]
  median_compensation: number
  level_distribution: Record<string, number>
  total_entries: number
}

export interface CompareResponse {
  salary_a: SalaryRecord
  salary_b: SalaryRecord
  diff: {
    base: number
    bonus: number
    stock: number
    total: number
    level_difference: string
  }
}

export interface StatsResponse {
  totalRecords: number
  uniqueCompanies: number
  topCompanies: Array<{ name: string; medianTC: number; count: number }>
}
