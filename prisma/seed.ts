// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function nc(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,]+$/, '')
}

function tc(base: number, bonus: number, stock: number): number {
  return base + bonus + stock
}

const records = [
  // GOOGLE
  { company: nc("Google"), role: "Software Engineer", level: "L3", location: "Bangalore", experience_years: 1, base_salary: 1800000, bonus: 270000, stock: 0 },
  { company: nc("Google"), role: "Software Engineer", level: "L4", location: "Bangalore", experience_years: 3, base_salary: 3200000, bonus: 480000, stock: 640000 },
  { company: nc("Google"), role: "Senior Software Engineer", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 6000000, bonus: 900000, stock: 1800000 },
  { company: nc("Google"), role: "Staff Engineer", level: "L6", location: "Hyderabad", experience_years: 10, base_salary: 10000000, bonus: 1500000, stock: 3000000 },
  { company: nc("Google"), role: "Data Scientist", level: "L4", location: "Bangalore", experience_years: 4, base_salary: 3500000, bonus: 525000, stock: 700000 },
  { company: nc("Google"), role: "Product Manager", level: "L5", location: "Bangalore", experience_years: 7, base_salary: 7000000, bonus: 1400000, stock: 2100000 },

  // MICROSOFT
  { company: nc("Microsoft"), role: "Software Engineer", level: "SDE-I", location: "Hyderabad", experience_years: 1, base_salary: 1600000, bonus: 240000, stock: 0 },
  { company: nc("Microsoft"), role: "Software Engineer", level: "SDE-II", location: "Hyderabad", experience_years: 3, base_salary: 2800000, bonus: 420000, stock: 560000 },
  { company: nc("Microsoft"), role: "Senior Software Engineer", level: "SDE-III", location: "Hyderabad", experience_years: 6, base_salary: 5000000, bonus: 750000, stock: 1500000 },
  { company: nc("Microsoft"), role: "Staff Engineer", level: "Staff", location: "Bangalore", experience_years: 10, base_salary: 9000000, bonus: 1350000, stock: 2700000 },
  { company: nc("Microsoft"), role: "Engineering Manager", level: "L6", location: "Hyderabad", experience_years: 12, base_salary: 11000000, bonus: 1650000, stock: 3300000 },

  // AMAZON
  { company: nc("Amazon"), role: "Software Engineer", level: "SDE-I", location: "Bangalore", experience_years: 1, base_salary: 1500000, bonus: 225000, stock: 300000 },
  { company: nc("Amazon"), role: "Software Engineer", level: "SDE-II", location: "Bangalore", experience_years: 4, base_salary: 2600000, bonus: 390000, stock: 780000 },
  { company: nc("Amazon"), role: "Senior Software Engineer", level: "SDE-III", location: "Bangalore", experience_years: 7, base_salary: 4500000, bonus: 675000, stock: 1350000 },
  { company: nc("Amazon"), role: "Data Scientist", level: "L5", location: "Hyderabad", experience_years: 5, base_salary: 4800000, bonus: 720000, stock: 1440000 },
  { company: nc("Amazon"), role: "Principal Engineer", level: "Principal", location: "Bangalore", experience_years: 14, base_salary: 18000000, bonus: 2700000, stock: 5400000 },

  // META
  { company: nc("Meta"), role: "Software Engineer", level: "L3", location: "Bangalore", experience_years: 1, base_salary: 2000000, bonus: 300000, stock: 400000 },
  { company: nc("Meta"), role: "Software Engineer", level: "L4", location: "Bangalore", experience_years: 3, base_salary: 3800000, bonus: 570000, stock: 760000 },
  { company: nc("Meta"), role: "Senior Software Engineer", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 7000000, bonus: 1050000, stock: 2100000 },
  { company: nc("Meta"), role: "Staff Engineer", level: "L6", location: "Bangalore", experience_years: 11, base_salary: 12000000, bonus: 1800000, stock: 3600000 },

  // TCS
  { company: nc("TCS"), role: "Software Engineer", level: "SDE-I", location: "Mumbai", experience_years: 1, base_salary: 700000, bonus: 70000, stock: 0 },
  { company: nc("TCS"), role: "Software Engineer", level: "SDE-II", location: "Pune", experience_years: 3, base_salary: 1200000, bonus: 120000, stock: 0 },
  { company: nc("TCS"), role: "Senior Software Engineer", level: "SDE-III", location: "Chennai", experience_years: 6, base_salary: 2000000, bonus: 200000, stock: 0 },
  { company: nc("TCS"), role: "Engineering Manager", level: "L6", location: "Bangalore", experience_years: 12, base_salary: 3500000, bonus: 350000, stock: 0 },
  { company: nc("TCS"), role: "Data Scientist", level: "SDE-II", location: "Hyderabad", experience_years: 4, base_salary: 1500000, bonus: 150000, stock: 0 },

  // INFOSYS
  { company: nc("Infosys"), role: "Software Engineer", level: "SDE-I", location: "Bangalore", experience_years: 1, base_salary: 650000, bonus: 65000, stock: 0 },
  { company: nc("Infosys"), role: "Software Engineer", level: "SDE-II", location: "Pune", experience_years: 3, base_salary: 1100000, bonus: 110000, stock: 0 },
  { company: nc("Infosys"), role: "Senior Software Engineer", level: "SDE-III", location: "Hyderabad", experience_years: 6, base_salary: 1800000, bonus: 180000, stock: 0 },
  { company: nc("Infosys"), role: "Staff Engineer", level: "Staff", location: "Bangalore", experience_years: 10, base_salary: 3000000, bonus: 300000, stock: 0 },

  // FLIPKART
  { company: nc("Flipkart"), role: "Software Engineer", level: "SDE-I", location: "Bangalore", experience_years: 1, base_salary: 1400000, bonus: 210000, stock: 280000 },
  { company: nc("Flipkart"), role: "Software Engineer", level: "SDE-II", location: "Bangalore", experience_years: 4, base_salary: 2500000, bonus: 375000, stock: 625000 },
  { company: nc("Flipkart"), role: "Senior Software Engineer", level: "SDE-III", location: "Bangalore", experience_years: 7, base_salary: 4200000, bonus: 630000, stock: 1260000 },
  { company: nc("Flipkart"), role: "Staff Engineer", level: "Staff", location: "Bangalore", experience_years: 10, base_salary: 7000000, bonus: 1050000, stock: 2100000 },
  { company: nc("Flipkart"), role: "Data Scientist", level: "SDE-II", location: "Bangalore", experience_years: 4, base_salary: 2800000, bonus: 420000, stock: 560000 },

  // SWIGGY
  { company: nc("Swiggy"), role: "Software Engineer", level: "SDE-I", location: "Bangalore", experience_years: 2, base_salary: 1300000, bonus: 195000, stock: 260000 },
  { company: nc("Swiggy"), role: "Software Engineer", level: "SDE-II", location: "Bangalore", experience_years: 4, base_salary: 2200000, bonus: 330000, stock: 440000 },
  { company: nc("Swiggy"), role: "Senior Software Engineer", level: "SDE-III", location: "Bangalore", experience_years: 7, base_salary: 3800000, bonus: 570000, stock: 950000 },
  { company: nc("Swiggy"), role: "Engineering Manager", level: "L6", location: "Bangalore", experience_years: 11, base_salary: 6500000, bonus: 975000, stock: 1625000 },

  // RAZORPAY
  { company: nc("Razorpay"), role: "Software Engineer", level: "SDE-I", location: "Bangalore", experience_years: 1, base_salary: 1600000, bonus: 240000, stock: 320000 },
  { company: nc("Razorpay"), role: "Software Engineer", level: "SDE-II", location: "Bangalore", experience_years: 3, base_salary: 2800000, bonus: 420000, stock: 700000 },
  { company: nc("Razorpay"), role: "Senior Software Engineer", level: "SDE-III", location: "Bangalore", experience_years: 6, base_salary: 4500000, bonus: 675000, stock: 1125000 },
  { company: nc("Razorpay"), role: "Staff Engineer", level: "Staff", location: "Bangalore", experience_years: 9, base_salary: 7500000, bonus: 1125000, stock: 2250000 },

  // NVIDIA
  { company: nc("NVIDIA"), role: "Software Engineer", level: "L4", location: "Bangalore", experience_years: 3, base_salary: 4000000, bonus: 600000, stock: 1200000 },
  { company: nc("NVIDIA"), role: "Senior Software Engineer", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 8000000, bonus: 1200000, stock: 2400000 },
  { company: nc("NVIDIA"), role: "ML Engineer", level: "L5", location: "Hyderabad", experience_years: 5, base_salary: 7500000, bonus: 1125000, stock: 2250000 },
  { company: nc("NVIDIA"), role: "Staff Engineer", level: "L6", location: "Bangalore", experience_years: 10, base_salary: 14000000, bonus: 2100000, stock: 4200000 },

  // ZEPTO
  { company: nc("Zepto"), role: "Software Engineer", level: "SDE-I", location: "Mumbai", experience_years: 1, base_salary: 1500000, bonus: 225000, stock: 300000 },
  { company: nc("Zepto"), role: "Software Engineer", level: "SDE-II", location: "Mumbai", experience_years: 3, base_salary: 2600000, bonus: 390000, stock: 650000 },
  { company: nc("Zepto"), role: "Senior Software Engineer", level: "SDE-III", location: "Mumbai", experience_years: 6, base_salary: 4200000, bonus: 630000, stock: 1050000 },

  // GROWW
  { company: nc("Groww"), role: "Software Engineer", level: "SDE-I", location: "Bangalore", experience_years: 2, base_salary: 1400000, bonus: 210000, stock: 280000 },
  { company: nc("Groww"), role: "Software Engineer", level: "SDE-II", location: "Bangalore", experience_years: 4, base_salary: 2400000, bonus: 360000, stock: 600000 },
  { company: nc("Groww"), role: "Senior Software Engineer", level: "SDE-III", location: "Bangalore", experience_years: 7, base_salary: 4000000, bonus: 600000, stock: 1000000 },

  // ADOBE
  { company: nc("Adobe"), role: "Software Engineer", level: "L4", location: "Noida", experience_years: 3, base_salary: 2200000, bonus: 330000, stock: 440000 },
  { company: nc("Adobe"), role: "Senior Software Engineer", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 4500000, bonus: 675000, stock: 1125000 },
  { company: nc("Adobe"), role: "Staff Engineer", level: "L6", location: "Noida", experience_years: 10, base_salary: 8000000, bonus: 1200000, stock: 2400000 },

  // ATLASSIAN
  { company: nc("Atlassian"), role: "Software Engineer", level: "L4", location: "Bangalore", experience_years: 3, base_salary: 3000000, bonus: 450000, stock: 750000 },
  { company: nc("Atlassian"), role: "Senior Software Engineer", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 5500000, bonus: 825000, stock: 1650000 },
  { company: nc("Atlassian"), role: "Staff Engineer", level: "L6", location: "Bangalore", experience_years: 11, base_salary: 9500000, bonus: 1425000, stock: 2850000 },

  // WIPRO
  { company: nc("Wipro"), role: "Software Engineer", level: "SDE-I", location: "Bangalore", experience_years: 1, base_salary: 600000, bonus: 60000, stock: 0 },
  { company: nc("Wipro"), role: "Software Engineer", level: "SDE-II", location: "Hyderabad", experience_years: 3, base_salary: 1000000, bonus: 100000, stock: 0 },
  { company: nc("Wipro"), role: "Senior Software Engineer", level: "SDE-III", location: "Pune", experience_years: 7, base_salary: 1700000, bonus: 170000, stock: 0 },
]

async function main() {
  console.log('Clearing existing data...')
  await prisma.salary.deleteMany()

  console.log(`Seeding ${records.length} records...`)
  for (const r of records) {
    await prisma.salary.create({
      data: {
        company: r.company,
        role: r.role,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        level: r.level.replace(/-/g, '_') as any,
        location: r.location,
        experience_years: r.experience_years,
        base_salary: r.base_salary,
        bonus: r.bonus ?? 0,
        stock: r.stock ?? 0,
        total_compensation: tc(r.base_salary, r.bonus ?? 0, r.stock ?? 0),
        confidence_score: 0.75 + Math.random() * 0.23,
      }
    })
  }
  console.log('Seeding complete. Inserted', records.length, 'salaries.')

  // Reviews Seed
  console.log('Seeding Reviews...')
  const reviews = [
    { company: 'google', rating_overall: 5, rating_wlb: 5, rating_culture: 5, rating_comp: 5, pros: 'Amazing perks, great WLB in my org, smart people.', cons: 'Promo velocity is very slow.', is_anonymous: true },
    { company: 'google', rating_overall: 4, rating_wlb: 4, rating_culture: 4, rating_comp: 4, pros: 'Great compensation and brand value.', cons: 'Bureaucracy and slow decision making.', is_anonymous: true },
    { company: 'amazon', rating_overall: 3, rating_wlb: 2, rating_culture: 3, rating_comp: 5, pros: 'High compensation and you learn a lot very fast.', cons: 'Terrible WLB, high pressure, PIP culture.', is_anonymous: true },
    { company: 'microsoft', rating_overall: 4, rating_wlb: 5, rating_culture: 4, rating_comp: 3, pros: 'Excellent WLB, very stable, good benefits.', cons: 'Comp is lower than FAANG peers.', is_anonymous: true },
    { company: 'tcs', rating_overall: 3, rating_wlb: 3, rating_culture: 3, rating_comp: 2, pros: 'Job security, good place to start career.', cons: 'Low pay, outdated tech stacks in many projects.', is_anonymous: true },
    { company: 'infosys', rating_overall: 3, rating_wlb: 4, rating_culture: 3, rating_comp: 2, pros: 'Good training campus, stable job.', cons: 'Very low salary hikes, bureaucratic.', is_anonymous: true }
  ]

  for (const review of reviews) {
    await prisma.review.create({ data: review })
  }

  console.log('Seeding Interviews...')
  const interviews = [
    { company: 'google', role: 'Software Engineer', difficulty: 4, offer_status: 'ACCEPTED' as const, process_duration: 45, questions: ['Design a rate limiter', 'Reverse a linked list'], experience: 'Standard 4 rounds of coding and 1 Googliness round.' },
    { company: 'amazon', role: 'SDE II', difficulty: 5, offer_status: 'REJECTED' as const, process_duration: 30, questions: ['Design an elevator system', 'Amazon Leadership Principles behavioral questions'], experience: 'Very heavy on LPs. Technical questions were graph-based.' },
    { company: 'microsoft', role: 'Software Engineer', difficulty: 3, offer_status: 'ACCEPTED' as const, process_duration: 21, questions: ['Find loop in linked list', 'System design for a chat application'], experience: 'Friendly interviewers, focused on problem-solving approach.' },
    { company: 'meta', role: 'Production Engineer', difficulty: 5, offer_status: 'NO_OFFER' as const, process_duration: 60, questions: ['Linux internals', 'Troubleshooting a slow web server'], experience: 'Very deep OS and networking questions.' }
  ]

  for (const interview of interviews) {
    await prisma.interview.create({ data: interview })
  }

  console.log('Database seeded successfully.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
