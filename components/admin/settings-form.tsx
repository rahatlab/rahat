'use client'

import { FileUp, RotateCcw } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { fileToDataUrl } from '@/lib/store'
import type { SiteSettings } from '@/lib/types'
import { apiGetSettings, apiUpdateSettings } from '@/lib/api'
import { CardSkeleton, ghostBtn, Panel, primaryBtn, SaveButton, Skeleton, TagInput, TextArea, TextInput, Toggle } from './fields'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const load = async () => {
    try {
      const data = await apiGetSettings()
      setSettings(data)
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  // Load on mount only
  useEffect(() => {
    load()
  }, [])

  if (loading || !settings) {
    return (
      <div className="flex flex-col gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  const s = settings
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setSettings((p) => p ? { ...p, [k]: v } : p)
  const setSocial = (k: keyof SiteSettings['socials'], v: string) => setSettings((p) => p ? { ...p, socials: { ...p.socials, [k]: v } } : p)

  const save = async () => {
    if (!s.name.trim() || !s.headline.trim()) throw new Error('Name and headline are required.')
    if (s.roles.length === 0) throw new Error('Add at least one typewriter role.')
    await apiUpdateSettings(s)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await save()
      toast.success('Settings saved', { description: 'Your changes are live on the site.' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save settings')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Site settings</h1>
          <p className="text-muted-foreground">Control your hero content, CV, socials and availability.</p>
        </div>
        <SaveButton onClick={save} onSuccessMessage="Settings saved" onErrorMessage="Could not save settings">
          Save changes
        </SaveButton>
      </div>

      <Panel title="Availability" description="Shown as a live badge in the hero.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between gap-4">
          <Toggle label="Available for freelance" checked={s.available} onChange={(v) => set('available', v)} />
          <div className="flex-1 min-w-0">
            <TextInput label="Badge text" value={s.availabilityText} onChange={(e) => set('availabilityText', e.target.value)} disabled={!s.available} />
          </div>
        </div>
      </Panel>

      <Panel title="Hero" description="Your introduction on the homepage.">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          <TextInput label="Name" value={s.name} onChange={(e) => set('name', e.target.value)} />
          <TextInput label="Initials" maxLength={3} value={s.initials} onChange={(e) => set('initials', e.target.value.toUpperCase())} />
          <TextInput className="col-span-1 sm:col-span-2" label="Headline" hint="The last two words get the gradient highlight." value={s.headline} onChange={(e) => set('headline', e.target.value)} />
          <TextArea className="col-span-1 sm:col-span-2" label="Bio" rows={4} value={s.bio} onChange={(e) => set('bio', e.target.value)} />
          <div className="col-span-1 sm:col-span-2">
            <TagInput label="Typewriter roles" value={s.roles} onChange={(v) => set('roles', v)} placeholder="Full-Stack Developer" />
          </div>
          <TextInput label="Location" value={s.location} onChange={(e) => set('location', e.target.value)} />
          <TextInput label="Contact email" type="email" value={s.email} onChange={(e) => set('email', e.target.value)} />
        </div>
      </Panel>

      <Panel title="CV / Résumé" description="The file visitors get from the Download CV button.">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
          <TextInput label="CV file URL" value={s.cvUrl.startsWith('data:') ? '' : s.cvUrl} placeholder={s.cvUrl.startsWith('data:') ? 'Uploaded file in use' : 'https://…/cv.pdf'} onChange={(e) => set('cvUrl', e.target.value)} />
          <TextInput label="Download file name" value={s.cvFileName} onChange={(e) => set('cvFileName', e.target.value)} />
        </div>
        <label className={`${ghostBtn} mt-4 cursor-pointer`}>
          <FileUp className="size-4" aria-hidden /> Upload new CV (PDF)
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              try {
                const url = await fileToDataUrl(file, 2 * 1024 * 1024)
                setSettings((p) => p ? { ...p, cvUrl: url, cvFileName: file.name } : p)
                toast.success('CV attached — remember to save.')
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Upload failed')
              }
            }}
          />
        </label>
      </Panel>

      <Panel title="Social links">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <TextInput label="GitHub" type="url" value={s.socials.github} onChange={(e) => setSocial('github', e.target.value)} />
          <TextInput label="LinkedIn" type="url" value={s.socials.linkedin} onChange={(e) => setSocial('linkedin', e.target.value)} />
          <TextInput label="Twitter / X" type="url" value={s.socials.twitter} onChange={(e) => setSocial('twitter', e.target.value)} />
        </div>
      </Panel>

      <Panel title="Danger zone" description="Restore the original demo content. This removes all your edits.">
        <button
          type="button"
          className={`${ghostBtn} text-destructive`}
          onClick={() => setShowResetDialog(true)}
        >
          <RotateCcw className="size-4" aria-hidden /> Reset demo data
        </button>
      </Panel>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset all data?"
        description="This will permanently delete all projects, posts, messages, and settings. This action cannot be undone."
        confirmText="Reset everything"
        variant="destructive"
        onConfirm={async () => {
          toast.error('Reset not implemented via API — use db:seed')
        }}
      />
    </form>
  )
}
