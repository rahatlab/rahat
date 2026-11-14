import type { Metadata } from 'next'
import { BlogIndex } from '@/components/site/blog-index'
import { JSONLD } from '@/components/site/json-ld'
import { SiteShell } from '@/components/site/site-shell'
import { getPosts } from '@/lib/data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Technical articles on web development and design.',
  openGraph: {
    title: 'Blog — Alex Rivera',
    description: 'Technical articles on web development and design.',
    type: 'website',
    url: `${siteUrl}/blog`,
  },
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <SiteShell settings={{ name: '', initials: '' }}>
      <JSONLD type="website" />
      <BlogIndex initialPosts={posts} />
    </SiteShell>
  )
}
