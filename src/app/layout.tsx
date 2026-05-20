import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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

import ThemeToggle from '@/components/ThemeToggle';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased`}>
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  )
}
