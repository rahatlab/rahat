import type { Metadata } from 'next'
import { BlogSection } from '@/components/site/blog-section'
import { ContactSection } from '@/components/site/contact-section'
import { Hero } from '@/components/site/hero'
import { JSONLD } from '@/components/site/json-ld'
import { ProjectsSection } from '@/components/site/projects-section'
import { Skills } from '@/components/site/skills'
import { SiteShell } from '@/components/site/site-shell'
import { getPosts, getProjects, getSettings, getSkills } from '@/lib/data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Force dynamic rendering so settings changes show immediately
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Alex Rivera — Full-Stack Developer',
  description:
    'Portfolio of Alex Rivera, a full-stack web developer and UI/UX architect building fast, accessible products with React, Next.js and TypeScript.',
  openGraph: {
    title: 'Alex Rivera — Full-Stack Developer',
    description: 'Building fast, beautiful products for the web.',
    type: 'website',
    url: siteUrl,
    images: [{ url: `${siteUrl}/api/og?title=Alex%20Rivera`, width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const [settings, skills, projects, posts] = await Promise.all([
    getSettings(),
    getSkills(),
    getProjects(),
    getPosts(),
  ])

  return (
    <SiteShell settings={settings}>
      <JSONLD type="person" settings={settings} />
      <JSONLD type="website" settings={settings} />
      <Hero settings={settings} />
      <Skills skills={skills} />
      <ProjectsSection projects={projects} />
      <BlogSection posts={posts} />
      <ContactSection settings={settings} />
    </SiteShell>
  )
}
