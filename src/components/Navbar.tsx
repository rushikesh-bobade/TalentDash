'use client'
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const country = (params?.country as string) || 'in'
  const [toolsOpen, setToolsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const links = [
    { href: `/${country}`, label: 'Home' },
    { href: `/${country}/salaries`, label: 'Salaries' },
    { href: `/${country}/titles`, label: 'By Role' },
    { href: `/${country}/locations`, label: 'By Location' },
    { href: `/${country}/heatmap`, label: 'Heatmap' },
    { href: `/${country}/reviews`, label: 'Reviews' },
    { href: `/${country}/interviews`, label: 'Interviews' },
    { href: `/${country}/compare`, label: 'Compare' },
  ]

  const toolLinks = [
    { href: `/${country}/tools/tc-calculator`, label: 'TC Calculator', emoji: '🧮', desc: 'Understand your total comp with RSU vesting' },
    { href: `/${country}/tools/hike-calculator`, label: 'Hike Calculator', emoji: '📈', desc: 'Plan your next salary negotiation' },
    { href: `/${country}/tools/benchmark`, label: 'Am I Underpaid?', emoji: '🎯', desc: 'Compare your salary against the market' },
  ]

  const searchTargets = [
    { label: 'Salaries', href: `/${country}/salaries` },
    { label: 'Companies', href: `/${country}/companies` },
    { label: 'Reviews', href: `/${country}/reviews` },
    { label: 'Interviews', href: `/${country}/interviews` },
    { label: 'TC Calculator', href: `/${country}/tools/tc-calculator` },
    { label: 'Hike Calculator', href: `/${country}/tools/hike-calculator` },
    { label: 'Benchmark', href: `/${country}/tools/benchmark` },
    { label: 'Heatmap', href: `/${country}/heatmap` },
    { label: 'Compare Offers', href: `/${country}/compare` },
    { label: 'Browse by Role', href: `/${country}/titles` },
    { label: 'Browse by Location', href: `/${country}/locations` },
  ]

  const filteredTargets = searchQuery.length > 0
    ? searchTargets.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchTargets

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setToolsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${country}`} className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center rounded-lg text-white font-black tracking-tighter text-sm shadow-md group-hover:scale-105 transition-transform">
              TD
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-slate-100 font-extrabold tracking-tight leading-none text-lg">
                TalentDash
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider leading-none mt-1">
                Data Platform
              </span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-1 ${
                  toolsOpen || pathname.includes('/tools/')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tools
                <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {toolsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {toolLinks.map(tool => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <span className="text-xl mt-0.5">{tool.emoji}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tool.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Search Button */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="hidden xl:inline">Search...</span>
                <kbd className="hidden xl:inline-flex h-5 items-center gap-0.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 px-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Search pages, tools, data..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && filteredTargets.length > 0) {
                          router.push(filteredTargets[0].href)
                          setSearchOpen(false)
                          setSearchQuery('')
                        }
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredTargets.map(t => (
                      <Link
                        key={t.href}
                        href={t.href}
                        onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        {t.label}
                      </Link>
                    ))}
                    {filteredTargets.length === 0 && (
                      <div className="px-3 py-4 text-sm text-slate-400 text-center">No results found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="px-4 py-3 space-y-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm font-semibold rounded-md ${
                  pathname === link.href
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Tools</div>
              {toolLinks.map(tool => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  <span>{tool.emoji}</span> {tool.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
