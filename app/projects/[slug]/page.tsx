import type { Metadata } from 'next'
import { ProjectDetail } from '@/components/site/project-detail'
import { JSONLD } from '@/components/site/json-ld'
import { SiteShell } from '@/components/site/site-shell'
import { getProject } from '@/lib/data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  return {
    title: project ? `${project.title} — Alex Rivera` : 'Project',
    description: project ? project.description : 'View project details.',
    openGraph: project
      ? {
          title: project.title,
          description: project.description,
          type: 'website',
          url: `${siteUrl}/projects/${slug}`,
          images: project.image ? [{ url: project.image }] : undefined,
        }
      : undefined,
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    return (
      <SiteShell settings={{ name: '', initials: '' }}>
        <div className="px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Project not found</h1>
        </div>
      </SiteShell>
    )
  }

  return (
    <SiteShell settings={{ name: '', initials: '' }}>
      <JSONLD type="person" />
      <ProjectDetail project={project} />
    </SiteShell>
  )
}
