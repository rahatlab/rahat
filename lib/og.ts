import { Metadata } from 'next'

export function ogImage({ title }: { title?: string }): Metadata['openGraph'] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent(title || 'Portfolio')}`,
        width: 1200,
        height: 630,
        alt: title || 'Portfolio',
      },
    ],
  }
}
