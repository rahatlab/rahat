import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminGate } from '@/components/admin/admin-gate'

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

export default function AdminLayout({ children }: { children: ReactNode }) {
  // AdminGate renders the admin shell (sidebar) only for protected pages —
  // public auth pages (login/forgot/reset) stay standalone.
  return <AdminGate>{children}</AdminGate>
}
