import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://seu-dominio.vercel.app'),
  title: 'BPA 3x3 - Gestão Financeira',
  description: 'Sistema de gestão financeira para o time BPA 3x3',
  openGraph: {
    title: 'BPA 3x3 – Dashboard',
    description: 'Acompanhe pagamentos, custos e metas do time BPA 3x3',
    url: 'https://seu-dominio.vercel.app',
    siteName: 'BPA 3x3',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BPA 3x3 – Dashboard',
    description: 'Acompanhe pagamentos, custos e metas do time BPA 3x3',
    images: ['/opengraph-image.png'],
  },
}

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-dvh bg-black text-white antialiased overflow-x-hidden`}>
        <div className="pointer-events-none fixed right-3 top-3 z-50 sm:right-4 sm:top-4">
          <div className="pointer-events-auto">
            <ThemeToggle />
          </div>
        </div>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  )
}
