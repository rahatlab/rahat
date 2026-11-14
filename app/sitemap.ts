import type { MetadataRoute } from 'next'
import { getPosts, getProjects } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()])

  const projectUrls = projects.map((p) => ({
    url: `https://alexrivera.dev/projects/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const postUrls = posts.map((p) => ({
    url: `https://alexrivera.dev/blog/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: 'https://alexrivera.dev',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://alexrivera.dev/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...projectUrls,
    ...postUrls,
  ]
}
