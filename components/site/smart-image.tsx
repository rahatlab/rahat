import Image from 'next/image'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface SmartImageProps {
  src: string
  alt: string
  /** Rendered like <img fill> inside a positioned parent. Default true. */
  fill?: boolean
  className?: string
  style?: CSSProperties
  sizes?: string
  priority?: boolean
  /** Intrinsic width/height when not using fill (avoids CLS). */
  width?: number
  height?: number
}

const isRemote = (src: string) => /^https?:\/\//.test(src)

/**
 * Image that uses next/image optimization for http(s) URLs (Cloudinary)
 * and falls back to a plain <img> for data: URLs (legacy uploads) and
 * local paths (SVGs can't pass through the optimizer).
 */
export function SmartImage({
  src,
  alt,
  fill = true,
  className,
  style,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  width,
  height,
}: SmartImageProps) {
  const fallback = (
    // eslint-disable-next-line @next/next/no-img-element -- data:/local src can't be optimized
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={cn(fill && 'absolute inset-0 size-full object-cover', className)}
      style={style}
    />
  )

  if (!src || !isRemote(src)) {
    return fallback
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', className)}
        style={style}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
    />
  )
}
