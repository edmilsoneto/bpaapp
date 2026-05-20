'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, DollarSign, LogOut } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/atletas', label: 'Atletas', icon: Users },
  { href: '/cobrancas', label: 'Cobranças', icon: CreditCard },
  { href: '/custos', label: 'Custos Fixos', icon: DollarSign },
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
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-black text-white relative">
      {/* Background glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-900/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <div className="w-full flex-none md:w-64 print:hidden relative z-10">
        <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-neutral-950/90 border-r border-neutral-900 text-white">
          {/* Logo */}
          <Link
            className="mb-4 flex flex-col items-start justify-end rounded-xl bg-black/80 p-4 md:h-40 border border-neutral-900 hover:border-fuchsia-900 transition-colors"
            href="/"
          >
            <Image src="/logo.png" alt="BPA 3x3 Logo" width={120} height={48} className="h-20 w-auto object-contain mb-2" />
            <div className="text-white font-bold text-2xl tracking-tighter">
              BPA 3x3
              <div className="text-sm font-normal text-fuchsia-400">Gestão Financeira</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex flex-row justify-start space-x-2 overflow-x-auto md:flex-col md:space-x-0 md:space-y-1 md:mt-4 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-[48px] grow items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3 transition-all duration-150 ${
                    isActive
                      ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/30'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-fuchsia-600 hover:text-white hover:border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-fuchsia-400'}`} />
                  <p className="hidden md:block">{label}</p>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 hidden md:block border-t border-neutral-900">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 rounded-lg p-3 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-grow p-6 md:overflow-y-auto md:p-10 print:p-0 print:overflow-visible relative z-10 transition-all duration-300 ease-out transform ${
          isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
