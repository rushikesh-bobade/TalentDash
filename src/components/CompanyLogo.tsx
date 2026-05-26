'use client'

import React, { useState } from 'react'

interface CompanyLogoProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const DOMAIN_MAP: Record<string, string> = {
  google: 'google.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.com',
  meta: 'meta.com',
  apple: 'apple.com',
  netflix: 'netflix.com',
  uber: 'uber.com',
  flipkart: 'flipkart.com',
  swiggy: 'swiggy.com',
  razorpay: 'razorpay.com',
  zepto: 'zeptonow.com',
  groww: 'groww.in',
  paytm: 'paytm.com',
  atlassian: 'atlassian.com',
  adobe: 'adobe.com',
  nvidia: 'nvidia.com',
  infosys: 'infosys.com',
  tcs: 'tcs.com',
  wipro: 'wipro.com',
  accenture: 'accenture.com',
  ibm: 'ibm.com'
}

export default function CompanyLogo({ name, size = 'md', className = '' }: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false)

  const normalizedName = name.toLowerCase().trim()
  const domain = DOMAIN_MAP[normalizedName] || `${normalizedName.replace(/[^a-z0-9]/g, '')}.com`
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }

  // Fallback gradient generation
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-400 to-teal-600',
    'from-rose-400 to-red-600',
    'from-amber-400 to-orange-600',
    'from-purple-500 to-fuchsia-600',
    'from-cyan-400 to-blue-600',
    'from-pink-400 to-rose-600',
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorIndex = Math.abs(hash) % colors.length
  const gradient = colors[colorIndex]

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (!imageError) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={`${name} logo`}
        onError={() => setImageError(true)}
        className={`flex-shrink-0 object-contain rounded-xl shadow-sm bg-white ${sizeClasses[size]} p-1 ${className}`}
        title={name}
      />
    )
  }

  return (
    <div 
      className={`flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white font-black shadow-inner ${sizeClasses[size]} ${className}`}
      title={name}
    >
      {initials}
    </div>
  )
}
