'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, DollarSign, LogOut, CalendarCheck, FileText } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/atletas', label: 'Atletas', icon: Users },
  { href: '/cobrancas', label: 'Cobranças', icon: CreditCard },
  { href: '/custos', label: 'Custos Fixos', icon: DollarSign },
  { href: '/frequencia', label: 'Frequência', icon: CalendarCheck },
  { href: '/relatorio', label: 'Relatório Mensal', icon: FileText },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      setIsPageVisible(false)
      const timeout = setTimeout(() => {
        setIsPageVisible(true)
      }, 120)
      previousPathname.current = pathname
      return () => clearTimeout(timeout)
    }
  }, [pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-black text-white md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Background glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 h-56 w-56 rounded-full bg-fuchsia-600/10 blur-[110px] sm:h-96 sm:w-96 sm:blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-fuchsia-900/5 blur-[90px] sm:h-80 sm:w-80 sm:blur-[120px]" />
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-full print:hidden md:sticky md:top-0 md:h-dvh">
        <div className="flex h-full flex-col border-b border-neutral-900 bg-neutral-950/90 px-3 py-3 text-white md:border-r md:border-b-0 md:px-2 md:py-4">
          {/* Logo */}
          <Link
            className="mb-3 flex flex-col items-start justify-end rounded-xl border border-neutral-900 bg-black/80 p-3 transition-colors hover:border-fuchsia-900 sm:p-4 md:mb-4 md:h-40"
            href="/"
          >
            <Image src="/logo.png" alt="BPA 3x3 Logo" width={120} height={48} className="mb-2 h-14 w-auto object-contain sm:h-16 md:h-20" />
            <div className="text-lg font-bold tracking-tighter text-white sm:text-xl md:text-2xl">
              BPA 3x3
              <div className="text-xs font-normal text-fuchsia-400 sm:text-sm">Gestão Financeira</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-1 md:mt-4 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-all duration-150 md:h-auto md:justify-start md:px-3 md:py-2 ${
                    isActive
                      ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/30'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-fuchsia-600 hover:text-white hover:border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-fuchsia-400'}`} />
                  <p className="hidden md:block">{label}</p>
                  <p className="md:hidden truncate max-w-[80px]">{label}</p>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button & Footer */}
          <div className="mt-3 border-t border-neutral-900 pt-3 md:mt-auto md:pt-4 flex flex-col gap-4">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 rounded-lg border border-neutral-800 px-3 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
              <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
            </button>
            <div className="text-center text-[10px] sm:text-xs text-neutral-600 font-medium tracking-wide pb-1">
              produzido por Edmilson Neto
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 flex-grow overflow-x-hidden p-4 transition-all duration-300 ease-out transform sm:p-6 md:overflow-y-auto md:p-8 lg:p-10 print:overflow-visible print:p-0 ${
          isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
