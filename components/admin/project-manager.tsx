'use client'

import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Star, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { apiDeleteProject, apiGetProjects, apiSaveProject } from '@/lib/api'
import { cloudinaryUpload, cloudinaryUploadMultiple } from '@/lib/cloudinary'
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from '@/lib/types'
import { CardSkeleton, Field, ghostBtn, inputClass, Panel, primaryBtn, SaveButton, Skeleton, TagInput, TextArea, TextInput, Toggle } from './fields'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Draft = Omit<Project, 'id' | 'slug' | 'createdAt'> & { id?: string }

const blank: Draft = {
  title: '', description: '', problem: '', architecture: '', features: [], image: '', gallery: [],
  tech: [], category: 'Web App', liveUrl: '', githubUrl: '', featured: false,
}

const isUrl = (v: string) => !v || /^https?:\/\/\S+$/.test(v)

function CloudinaryImageInput({
  label,
  value,
  onChange,
  multiple = false,
  accept = 'image/*',
}: {
  label: string
  value: string | string[]
  onChange: (v: string | string[]) => void
  multiple?: boolean
  accept?: string
}) {
  const id = useId()
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const fileList = Array.from(files)
      if (multiple) {
        const urls = await cloudinaryUploadMultiple(fileList)
        onChange([...(value as string[]), ...urls])
      } else {
        const url = await cloudinaryUpload(fileList[0])
        onChange(url)
      }
      toast.success('Image uploaded to Cloudinary')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Field label={label} htmlFor={id}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-glass-border bg-background/40 sm:w-48">
          {typeof value === 'string' && value ? (
            <img src={value} alt="Preview" className="size-full object-cover" />
          ) : Array.isArray(value) && value.length > 0 ? (
            <img src={value[0]} alt="Preview" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-glass-border px-3 py-2 text-xs font-medium hover:bg-foreground/5">
            {uploading ? <Upload className="size-3.5 animate-spin" aria-hidden /> : <Upload className="size-3.5" aria-hidden />}
            {uploading ? ' Uploading…' : multiple ? 'Add images' : 'Upload image'}
          </label>
          {typeof value === 'string' && value && (
            <button type="button" onClick={() => onChange('')} className="rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-destructive">
              Remove
            </button>
          )}
          {Array.isArray(value) && value.length > 0 && (
            <button type="button" onClick={() => onChange([])} className="rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-destructive">
              Clear all
            </button>
          )}
        </div>
      </div>
    </Field>
  )
}

/**
 * Thumbnail grid for gallery images:
 * ⭐ set-as-cover, ⬆️⬇️ reorder, ❌ remove, plus multi-file upload.
 */
function GalleryGrid({
  gallery,
  cover,
  onGalleryChange,
  onCoverChange,
}: {
  gallery: string[]
  cover: string
  onGalleryChange: (v: string[]) => void
  onCoverChange: (v: string) => void
}) {
  const fileId = useId()
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const urls = await cloudinaryUploadMultiple(Array.from(files))
      onGalleryChange([...gallery, ...urls])
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} added`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= gallery.length) return
    const next = [...gallery]
    ;[next[i], next[j]] = [next[j], next[i]]
    onGalleryChange(next)
  }

  const removeAt = (i: number) => onGalleryChange(gallery.filter((_, idx) => idx !== i))

  const setCover = (url: string) => {
    onCoverChange(url)
    toast.success('Cover image updated')
  }

  return (
    <Field
      label="Gallery images"
      hint={`Show order = array order. ${gallery.length}/8 uploaded. First image shows first on the detail page.`}
      htmlFor={fileId}
    >
      <input
        id={fileId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <label
        htmlFor={fileId}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-glass-border px-3 py-2 text-xs font-medium hover:bg-foreground/5"
      >
        {uploading ? <Upload className="size-3.5 animate-spin" aria-hidden /> : <Upload className="size-3.5" aria-hidden />}
        {uploading ? ' Uploading…' : 'Add images (multiple)'}
      </label>

      {gallery.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((url, i) => {
            const isCover = url === cover
            return (
              <li key={`${url}-${i}`} className="group relative overflow-hidden rounded-xl border border-glass-border bg-background/40">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin upload preview */}
                <img src={url} alt={`Gallery image ${i + 1}`} className="aspect-[16/10] w-full object-cover" />

                {/* Order badge */}
                <span className="absolute left-1.5 top-1.5 rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
                  {i + 1}
                </span>
                {isCover && (
                  <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                    <Star className="size-2.5 fill-current" aria-hidden /> Cover
                  </span>
                )}

                {/* Hover controls */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => setCover(url)}
                    disabled={isCover}
                    aria-label={`Set image ${i + 1} as cover`}
                    title="Set as cover"
                    className="rounded-lg bg-background/80 p-1.5 hover:bg-primary/20 disabled:opacity-40"
                  >
                    <Star className={isCover ? 'size-3.5 fill-primary text-primary' : 'size-3.5'} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move image ${i + 1} earlier`}
                    title="Move earlier"
                    className="rounded-lg bg-background/80 p-1.5 hover:bg-foreground/10 disabled:opacity-40"
                  >
                    <ArrowUp className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === gallery.length - 1}
                    aria-label={`Move image ${i + 1} later`}
                    title="Move later"
                    className="rounded-lg bg-background/80 p-1.5 hover:bg-foreground/10 disabled:opacity-40"
                  >
                    <ArrowDown className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    aria-label={`Remove image ${i + 1}`}
                    title="Remove"
                    className="rounded-lg bg-background/80 p-1.5 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Field>
  )
}

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const params = useSearchParams()
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(params.get('new') ? { ...blank } : null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; project: Project | null }>({ open: false, project: null })
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))

  useEffect(() => {
    let mounted = true
    apiGetProjects()
      .then((data) => { if (mounted) setProjects(data) })
      .catch((err) => { console.error(err); toast.error('Failed to load projects') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const close = () => {
    setDraft(null)
    router.replace('/admin/projects')
  }

  const save = async () => {
    if (!draft) return
    if (draft.title.trim().length < 2) throw new Error('Title is required.')
    if (!draft.description.trim()) throw new Error('Short description is required.')
    if (!isUrl(draft.liveUrl) || !isUrl(draft.githubUrl)) throw new Error('Links must start with http:// or https://')
    await apiSaveProject({ ...draft, title: draft.title.trim() })
    close()
    const updated = await apiGetProjects()
    setProjects(updated)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await save()
      toast.success(draft?.id ? 'Project updated' : 'Project published')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save project')
    }
  }

  const remove = async (p: Project) => {
    setDeleteConfirm({ open: true, project: p })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.project) return
    try {
      await apiDeleteProject(deleteConfirm.project.id)
      toast.success('Project deleted')
      const updated = await apiGetProjects()
      setProjects(updated)
    } catch {
      toast.error('Could not delete project')
    } finally {
      setDeleteConfirm({ open: false, project: null })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">{projects.length} projects in your showcase</p>
        </div>
        {!draft && (
          <button type="button" onClick={() => setDraft({ ...blank })} className={primaryBtn}>
            <Plus className="size-4" aria-hidden /> New project
          </button>
        )}
      </div>

      {draft && (
        <form onSubmit={onSubmit}>
          <Panel
            title={draft.id ? 'Edit project' : 'New project'}
            actions={<button type="button" onClick={close} aria-label="Close form" className="rounded-lg p-1.5 hover:bg-foreground/5"><X className="size-4" aria-hidden /></button>}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextInput label="Title" required value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Nebula Analytics" />
              <Field label="Category" htmlFor="project-category">
                <select id="project-category" value={draft.category} onChange={(e) => set('category', e.target.value as ProjectCategory)} className={inputClass}>
                  {PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <TextArea className="md:col-span-2" label="Short description" rows={2} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="One or two sentences shown on the card." />
              <TextArea label="Problem statement" rows={4} value={draft.problem} onChange={(e) => set('problem', e.target.value)} />
              <TextArea label="Architecture" rows={4} value={draft.architecture} onChange={(e) => set('architecture', e.target.value)} />
              <TextArea
                className="md:col-span-2"
                label="Key features"
                hint="One feature per line."
                rows={4}
                value={draft.features.join('\n')}
                onChange={(e) => set('features', e.target.value.split('\n'))}
                onBlur={(e) => set('features', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
              />
              <div className="md:col-span-2">
                <CloudinaryImageInput
                  label="Cover image"
                  value={draft.image}
                  onChange={(v) => set('image', typeof v === 'string' ? v : v[0])}
                />
              </div>
              <div className="md:col-span-2">
                <GalleryGrid
                  gallery={draft.gallery}
                  cover={draft.image}
                  onGalleryChange={(v) => set('gallery', v)}
                  onCoverChange={(v) => set('image', v)}
                />
              </div>
              <div className="md:col-span-2">
                <TagInput label="Tech stack" value={draft.tech} onChange={(v) => set('tech', v)} placeholder="Next.js, Postgres…" />
              </div>
              <TextInput label="Live URL" type="url" value={draft.liveUrl} onChange={(e) => set('liveUrl', e.target.value)} placeholder="https://" />
              <TextInput label="GitHub URL" type="url" value={draft.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} placeholder="https://github.com/…" />
              <div className="md:col-span-2">
                <Toggle label="Featured" description="Highlight this project" checked={draft.featured} onChange={(v) => set('featured', v)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={close} className={ghostBtn}>Cancel</button>
              <SaveButton onClick={save} onSuccessMessage={draft.id ? 'Project updated' : 'Project published'} onErrorMessage="Could not save project">
                {draft.id ? 'Save changes' : 'Publish project'}
              </SaveButton>
            </div>
          </Panel>
        </form>
      )}

      <ul className="grid grid-cols-1 gap-3">
        {projects.map((p) => (
          <li key={p.id} className="glass flex min-w-0 flex-col gap-4 rounded-2xl p-3 sm:flex-row sm:items-center">
            <img src={p.image || '/placeholder.svg'} alt="" className="aspect-[16/10] w-full max-w-full rounded-xl object-cover sm:w-32" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.title}</p>
              <p className="truncate text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{p.category} · {(p.tech ?? []).slice(0, 4).join(', ')}</p>
            </div>
            <div className="flex gap-1">
              <Link href={`/projects/${p.slug}`} target="_blank" aria-label={`View ${p.title}`} className="rounded-lg p-2 hover:bg-foreground/5"><ExternalLink className="size-4" aria-hidden /></Link>
              <button type="button" onClick={() => { setDraft({ ...p }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label={`Edit ${p.title}`} className="rounded-lg p-2 hover:bg-foreground/5"><Pencil className="size-4" aria-hidden /></button>
              <button type="button" onClick={() => remove(p)} aria-label={`Delete ${p.title}`} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" aria-hidden /></button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
        title="Delete project?"
        description={`Are you sure you want to delete "${deleteConfirm.project?.title}"? This cannot be undone.`}
        confirmText="Delete project"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
