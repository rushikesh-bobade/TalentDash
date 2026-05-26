import { z } from 'zod'

export const VALID_LEVELS = ['L3', 'L4', 'L5', 'L6', 'SDE-I', 'SDE-II', 'SDE-III', 'Staff', 'Principal'] as const
export type ValidLevel = typeof VALID_LEVELS[number]

export const SalaryIngestionSchema = z.object({
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name too long'),
  role: z.string()
    .min(1, 'Role is required')
    .max(100, 'Role name too long'),
  level: z.enum(VALID_LEVELS, {
    message: `Level must be one of: ${VALID_LEVELS.join(', ')}`
  }),
  location: z.string()
    .min(1, 'Location is required')
    .max(100, 'Location too long'),
  experience_years: z.number()
    .int('Experience must be a whole number')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  base_salary: z.number()
    .positive('Base salary must be positive')
    .min(1, 'Base salary must be greater than 0'),
  bonus: z.number().min(0).default(0),
  stock: z.number().min(0).default(0),
  confidence_score: z.number()
    .min(0, 'Confidence score must be between 0 and 1')
    .max(1, 'Confidence score must be between 0 and 1')
    .default(0.8),
})

export type SalaryIngestionInput = z.infer<typeof SalaryIngestionSchema>

export const SalaryQuerySchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  level: z.string().optional(),
  location: z.string().optional(),
  sort: z.enum(['total_compensation', 'base_salary', 'experience_years']).default('total_compensation'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
})

export type SalaryQueryInput = z.infer<typeof SalaryQuerySchema>
