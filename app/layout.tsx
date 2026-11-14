import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/site/theme-provider'
import { CommandPalette } from '@/components/site/command-palette'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Alex Rivera — Full-Stack Developer',
    template: '%s · Alex Rivera',
  },
  description:
    'Portfolio of Alex Rivera, a full-stack web developer and UI/UX architect building fast, accessible products with React, Next.js and TypeScript.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <link rel="manifest" href="/manifest.json" />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
          <CommandPalette />
          <Toaster position="bottom-right" theme="system" richColors closeButton />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          id="sw-register"
          dangerouslySetInnerHTML={{
            __html: process.env.NODE_ENV === 'production'
              ? `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').then(
                  (reg) => console.log('[SW] registered', reg.scope),
                  (err) => console.error('[SW] registration failed', err)
                );
              }
            `
              : `
              if ('serviceWorker' in navigator) {
                // Dev: a cached page holds stale HTML/chunks and breaks React
                // hydration — always run the dev server without a SW.
                navigator.serviceWorker.getRegistrations().then((regs) =>
                  regs.forEach((reg) => reg.unregister())
                );
                if (window.caches) {
                  caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
