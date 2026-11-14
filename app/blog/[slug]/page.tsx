import type { Metadata } from 'next'
import { PostDetail } from '@/components/site/post-detail'
import { JSONLD } from '@/components/site/json-ld'
import { SiteShell } from '@/components/site/site-shell'
import { getPost } from '@/lib/data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post ? `${post.title} — Alex Rivera` : 'Blog post',
    description: post ? post.excerpt : 'Read the full article.',
    openGraph: post
      ? {
          title: post.title,
          description: post.excerpt,
          type: 'article',
          url: `${siteUrl}/blog/${slug}`,
          images: post.cover ? [{ url: post.cover }] : undefined,
        }
      : undefined,
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return (
      <SiteShell settings={{ name: '', initials: '' }}>
        <div className="px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Post not found</h1>
        </div>
      </SiteShell>
    )
  }

  return (
    <SiteShell settings={{ name: '', initials: '' }}>
      <JSONLD type="blog" post={post} />
      <PostDetail post={post} />
    </SiteShell>
  )
}
