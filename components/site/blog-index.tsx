'use client'

import type { Post } from '@/lib/types'
import { useEffect, useState } from 'react'
import { Reveal, SectionHeading } from './motion'
import { PostCard } from './post-card'
import { apiGetPosts } from '@/lib/api'

export function BlogIndex({ initialPosts }: { initialPosts?: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || [])

  useEffect(() => {
    if (initialPosts) return
    let mounted = true
    apiGetPosts()
      .then((data) => { if (mounted) setPosts(data) })
      .catch((err) => { console.error(err) })
    return () => { mounted = false }
  }, [initialPosts])

  const published = posts.filter((p) => p.published)
  return (
    <section className="px-4 pb-24 pt-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="blog" title="Articles & notes" description="Writing about frontend architecture, design systems and shipping fast." />
        {published.length === 0 ? (
          <p className="text-center text-muted-foreground">No articles published yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {published.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
