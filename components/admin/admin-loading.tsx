/**
 * Admin loading UIs — deliberately different from the public site:
 * public = page-structure skeletons, admin = console boot / in-shell content.
 * Used by AdminGate (auth check) and app/admin/loading.tsx (segment load).
 */

function Skel({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/70 ${className ?? ''}`} />
}

const BOOT_LINES = ['verifying session', 'loading console'] as const

/**
 * Centered "console boot" card — shown while AdminGate checks the session
 * (replaces the old blank `return null`).
 */
export function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
        <p className="font-mono text-sm font-medium text-primary">~/admin</p>
        <div className="mt-6 space-y-2.5 text-left">
          {BOOT_LINES.map((line, i) => (
            <p
              key={line}
              className="animate-fade-in-up font-mono text-xs text-muted-foreground"
              style={{ animationDelay: `${i * 0.25}s` }}
            >
              <span className="text-primary">▸</span> {line}…
            </p>
          ))}
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Loading admin">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan to-violet animate-progress" />
        </div>
      </div>
    </div>
  )
}

/**
 * In-shell content skeleton — renders inside AdminShell (sidebar persists)
 * while an admin page segment streams in.
 */
export function AdminContentLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading admin page">
      <div>
        <Skel className="h-8 w-48" />
        <Skel className="mt-2 h-4 w-72" />
      </div>
      <p className="font-mono text-xs text-muted-foreground" aria-hidden>
        <span className="text-primary">&gt;</span> <span className="text-accent">&quot;/admin&quot;</span> loading…
        <span className="ml-1 inline-block h-3 w-1.5 animate-blink bg-primary align-middle" />
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass space-y-3 rounded-2xl p-5">
            <Skel className="h-5 w-5" />
            <Skel className="h-8 w-16" />
            <Skel className="h-4 w-28" />
          </div>
        ))}
      </div>
      <div className="glass space-y-3 rounded-2xl p-5">
        <Skel className="h-5 w-40" />
        <Skel className="h-4 w-full" />
        <Skel className="h-4 w-5/6" />
        <Skel className="h-4 w-2/3" />
      </div>
    </div>
  )
}
