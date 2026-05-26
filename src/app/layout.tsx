import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'TalentDash — Compensation Intelligence',
    template: '%s | TalentDash',
  },
  description: 'Verified, level-based salary data across top tech companies in India.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1 w-full relative">
            {/* Subtle industrial grid background globally */}
            <div className="absolute inset-0 z-[-1] bg-grid-pattern dark:bg-grid-pattern-dark bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:[mask-image:linear-gradient(180deg,black,rgba(0,0,0,0))] opacity-50 dark:opacity-20" />
            {children}
          </main>
          
          {/* Simple Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 mt-auto transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-indigo-600 flex items-center justify-center rounded text-white text-[10px] font-black tracking-tighter">TD</div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">TalentDash</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} TalentDash. Empowering the tech workforce.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
