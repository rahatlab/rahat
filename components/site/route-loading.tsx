import type { CSSProperties, ReactNode } from 'react'

/**
 * Route-change loading UIs with a coding/terminal vibe.
 * Used by app/**\/loading.tsx (server components — no hooks here).
 */

function Skel({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded-xl bg-muted/70 ${className ?? ''}`} style={style} />
}

/** Monospace terminal line: > render("/blog") … ▍ */
export function TerminalLine({ path }: { path: string }) {
  return (
    <p className="font-mono text-xs text-muted-foreground" aria-hidden>
      <span className="text-primary">&gt;</span> render(<span className="text-accent">&quot;{path}&quot;</span>) …{' '}
      <span className="ml-0.5 inline-block h-3 w-1.5 animate-blink bg-primary align-middle" />
    </p>
  )
}

/**
 * Faux navbar so the transition doesn't blink —
 * SiteShell (real navbar) lives at page level and mounts after the stream.
 */
function FauxNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-glass-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Skel className="size-8 rounded-lg" />
          <Skel className="h-4 w-16" />
        </div>
        <div className="hidden items-center gap-5 sm:flex">
          <Skel className="h-3.5 w-12" />
          <Skel className="h-3.5 w-12" />
          <Skel className="h-3.5 w-12" />
          <Skel className="h-3.5 w-12" />
        </div>
        <Skel className="size-9 rounded-full" />
      </div>
    </header>
  )
}

/** Shared shell: faux navbar + terminal line + content skeleton. */
export function RouteLoading({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <FauxNavbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <TerminalLine path={path} />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}

function PostCardSkel() {
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="aspect-[16/9] w-full animate-pulse bg-muted/70" />
      <div className="space-y-3 p-6">
        <Skel className="h-3 w-28" />
        <Skel className="h-5 w-3/4" />
        <Skel className="h-4 w-full" />
        <Skel className="h-4 w-2/3" />
        <div className="flex gap-1.5 pt-2">
          <Skel className="h-5 w-14" />
          <Skel className="h-5 w-16" />
          <Skel className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}

/** `/` — hero + project cards */
export function HomeLoading() {
  return (
    <RouteLoading path="/">
      {/* Hero */}
      <div className="space-y-4 pt-8">
        <Skel className="h-4 w-40" />
        <Skel className="h-12 w-2/3 md:h-16 md:w-1/2" />
        <Skel className="h-4 w-1/3" />
        <div className="max-w-2xl space-y-2.5 pt-2">
          <Skel className="h-4 w-full" />
          <Skel className="h-4 w-5/6" />
        </div>
        <div className="flex gap-3 pt-4">
          <Skel className="h-11 w-40 rounded-full" />
          <Skel className="h-11 w-36 rounded-full" />
        </div>
      </div>
      {/* Cards */}
      <div className="mt-20 space-y-6">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <Skel className="mx-auto h-3.5 w-24" />
          <Skel className="mx-auto h-8 w-3/4" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PostCardSkel />
          <PostCardSkel />
          <PostCardSkel />
        </div>
      </div>
    </RouteLoading>
  )
}

/** `/blog` — heading + post cards */
export function BlogLoading() {
  return (
    <RouteLoading path="/blog">
      <div className="space-y-6">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <Skel className="mx-auto h-3.5 w-20" />
          <Skel className="mx-auto h-9 w-2/3" />
          <Skel className="mx-auto h-4 w-1/2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PostCardSkel />
          <PostCardSkel />
          <PostCardSkel />
        </div>
      </div>
    </RouteLoading>
  )
}

/** `/blog/[slug]` — article */
export function PostLoading() {
  return (
    <RouteLoading path="/blog/[slug]">
      <div className="mx-auto max-w-3xl space-y-5">
        <Skel className="h-4 w-24" />
        <div className="space-y-3 pt-4">
          <Skel className="h-3 w-32" />
          <Skel className="h-10 w-full" />
          <Skel className="h-10 w-3/4" />
          <Skel className="h-5 w-full" />
          <Skel className="h-5 w-2/3" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skel className="h-5 w-16" />
          <Skel className="h-5 w-20" />
          <Skel className="h-5 w-14" />
        </div>
        <div className="aspect-[16/9] w-full animate-pulse rounded-3xl bg-muted/70" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skel key={i} className="h-4 w-full" style={{ width: i === 5 ? '60%' : '100%' }} />
          ))}
        </div>
      </div>
    </RouteLoading>
  )
}

/** `/projects/[slug]` — project detail */
export function ProjectLoading() {
  return (
    <RouteLoading path="/projects/[slug]">
      <div className="space-y-5">
        <Skel className="h-4 w-28" />
        <div className="space-y-3">
          <Skel className="h-3 w-28" />
          <Skel className="h-12 w-2/3 md:h-14" />
          <Skel className="h-5 w-full max-w-2xl" />
          <Skel className="h-5 w-2/3 max-w-xl" />
        </div>
        <div className="flex gap-3 pt-1">
          <Skel className="h-11 w-32 rounded-full" />
          <Skel className="h-11 w-36 rounded-full" />
        </div>
        <div className="mt-6 aspect-[16/10] w-full animate-pulse rounded-3xl bg-muted/70" />
        <div className="flex gap-3">
          <Skel className="h-16 w-28" />
          <Skel className="h-16 w-28" />
          <Skel className="h-16 w-28" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="glass space-y-3 rounded-3xl p-6">
            <Skel className="h-5 w-32" />
            <Skel className="h-4 w-full" />
            <Skel className="h-4 w-5/6" />
            <Skel className="h-4 w-2/3" />
          </div>
          <div className="glass space-y-3 rounded-3xl p-6">
            <Skel className="h-5 w-36" />
            <Skel className="h-4 w-full" />
            <Skel className="h-4 w-4/5" />
            <Skel className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </RouteLoading>
  )
}
