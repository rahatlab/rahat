'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Theme-aware Rahat logo.
 * Dark mode → logo-dark.png (dark rounded square), Light mode → logo-light.png.
 * Renders nothing until mounted to avoid hydration mismatch.
 */
export function Logo({ className, alt = 'Rahat' }: { className?: string; alt?: string }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Reserve space with the dark variant (default theme is dark)
    return (
      <span
        className={cn('relative block bg-background/40', className)}
        aria-hidden
      />
    )
  }

  const src = resolvedTheme === 'light' ? '/logo-light.png' : '/logo-dark.png'

  // object-contain: artwork's own rounded-square shape stays fully visible
  // (object-cover used to crop the corners against the container radius)
  return (
    <span className={cn('relative block', className)}>
      <Image src={src} alt={alt} fill sizes="40px" className="object-contain" />
    </span>
  )
}
