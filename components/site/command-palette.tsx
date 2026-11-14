'use client'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from 'cmdk'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Palette, ShieldCheck, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      // Escape to close
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [])

  const commands = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
      description: 'Open admin panel',
    },
    {
      icon: Search,
      label: 'Search',
      href: '/#projects',
      description: 'Jump to projects section',
    },
    {
      icon: Palette,
      label: 'Toggle theme',
      description: 'Switch dark/light mode',
      onClick: () => {
        document.documentElement.classList.toggle('dark')
      },
    },
    {
      icon: ShieldCheck,
      label: 'Admin login',
      href: '/admin/login',
      description: 'Sign in to admin panel',
    },
  ]

  // Hidden until ⌘K / Ctrl+K is pressed — cmdk's plain <Command> has no
  // open/hidden handling, so we gate the whole overlay ourselves.
  if (!open) return null

  const run = (cmd: (typeof commands)[number]) => {
    if (cmd.onClick) cmd.onClick()
    else if (cmd.href) router.push(cmd.href)
    setOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-[92vw] max-w-[420px]">
        <Command loop className="overflow-hidden rounded-xl border border-glass-border bg-background shadow-2xl">
          <CommandInput
            placeholder="Type a command or search…"
            autoFocus
            className="border-b border-glass-border p-4 text-sm"
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {commands.map((cmd) => (
              <CommandItem
                key={cmd.label}
                onSelect={() => run(cmd)}
                className={cn(
                  'group flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors',
                  'aria-selected:bg-accent aria-selected:text-accent-foreground',
                )}
              >
                <cmd.icon className="size-4 text-muted-foreground group-hover:text-primary" aria-hidden />
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{cmd.label}</span>
                  {cmd.description && (
                    <span className="truncate text-xs text-muted-foreground">{cmd.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </div>
    </div>
  )
}
