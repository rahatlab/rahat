'use client'

import { FileText, FolderKanban, Mail, Plus, Radio } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiGetMessages, apiGetPosts, apiGetProjects, apiGetSettings } from '@/lib/api'
import { CardSkeleton, Skeleton } from '@/components/admin/fields'
import { formatDate } from '@/lib/store'
import type { ContactMessage, Post, Project, SiteSettings } from '@/lib/types'

export default function AdminOverview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([apiGetProjects(), apiGetPosts(), apiGetMessages(), apiGetSettings()])
      .then(([p, b, m, s]) => {
        if (!mounted) return
        setProjects(p)
        setPosts(b)
        setMessages(m)
        setSettings(s)
      })
      .catch((err) => console.error(err))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const stats = [
    { label: 'Projects', value: projects.length, icon: FolderKanban, href: '/admin/projects' },
    { label: 'Published posts', value: posts.filter((p) => p.published).length, icon: FileText, href: '/admin/blog' },
    { label: 'Unread messages', value: messages.filter((m) => !m.read).length, icon: Mail, href: '/admin/messages' },
  ]

  if (loading) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading dashboard">
        <div>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Manage everything on your portfolio from here.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="glass rounded-2xl p-5 transition-colors hover:border-primary/40 min-w-0">
            <s.icon className="size-5 text-primary" aria-hidden />
            <p className="mt-4 font-heading text-3xl font-bold truncate">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Radio className={`size-5 ${settings?.available ? 'text-emerald-500' : 'text-muted-foreground'}`} aria-hidden />
          <div>
            <p className="font-medium">{settings?.available ? settings.availabilityText : 'Not available'}</p>
            <p className="text-sm text-muted-foreground">Current availability status shown on the site</p>
          </div>
        </div>
        <Link href="/admin/settings" className="text-sm text-primary underline underline-offset-4">Change</Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Link href="/admin/projects?new=1" className="glass flex items-center gap-3 rounded-2xl p-5 hover:border-primary/40 min-w-0">
          <Plus className="size-5 text-primary" aria-hidden /> <span className="font-medium truncate">Add a new project</span>
        </Link>
        <Link href="/admin/blog?new=1" className="glass flex items-center gap-3 rounded-2xl p-5 hover:border-primary/40 min-w-0">
          <Plus className="size-5 text-accent" aria-hidden /> <span className="font-medium truncate">Write a blog post</span>
        </Link>
      </div>

      <section className="glass rounded-2xl p-5">
        <h2 className="font-semibold">Latest messages</h2>
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <div className="mt-3">
            <ul className="divide-y divide-glass-border">
              {messages.slice(0, 4).map((m) => (
                <li key={m.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{m.subject}</span>
                    <span className="block truncate text-muted-foreground">{m.name} · {m.email}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground whitespace-nowrap">{formatDate(m.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
