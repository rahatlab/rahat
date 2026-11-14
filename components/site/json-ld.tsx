'use client'

import type { SiteSettings } from '@/lib/types'
import type { Post } from '@/lib/types'

type JsonLdProps = {
  type: 'person' | 'blog' | 'website'
  settings?: SiteSettings
  post?: Post
}

export function JSONLD({ type, settings, post }: JsonLdProps) {
  let json: Record<string, any> = {}

  if (type === 'person' && settings) {
    json = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: settings.name,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      image: settings.cvUrl || undefined,
      jobTitle: settings.headline,
      knowsAbout: settings.roles,
      email: settings.email,
      sameAs: [
        settings.socials.github,
        settings.socials.linkedin,
        settings.socials.twitter,
      ].filter(Boolean),
    }
  } else if (type === 'blog' && post && settings) {
    json = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.cover || undefined,
      datePublished: post.createdAt,
      dateModified: post.createdAt,
      author: {
        '@type': 'Person',
        name: settings.name,
      },
      publisher: {
        '@type': 'Organization',
        name: settings.name,
      },
      tags: post.tags,
    }
  } else if (type === 'website' && settings) {
    json = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: settings.name,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      description: settings.headline,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#contact`,
      },
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}
