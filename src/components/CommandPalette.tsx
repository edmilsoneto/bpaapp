'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, DollarSign, CalendarCheck, FileText } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] sm:pt-[10vh]">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setOpen(false)}
      />
      <Command 
        className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl shadow-fuchsia-900/20 mx-4"
        loop
      >
        <Command.Input 
          placeholder="Digite um comando ou busque uma página..." 
          className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-neutral-500"
        />
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm text-neutral-500">
            Nenhum resultado encontrado.
          </Command.Empty>
          
          <Command.Group heading="Navegação" className="text-xs font-medium text-neutral-400 px-2 py-1.5">
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/'))}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-fuchsia-600/20 aria-selected:text-fuchsia-400"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/atletas'))}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-fuchsia-600/20 aria-selected:text-fuchsia-400"
            >
              <Users className="h-4 w-4" />
              <span>Atletas</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/cobrancas'))}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-fuchsia-600/20 aria-selected:text-fuchsia-400"
            >
              <CreditCard className="h-4 w-4" />
              <span>Cobranças</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/custos'))}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-fuchsia-600/20 aria-selected:text-fuchsia-400"
            >
              <DollarSign className="h-4 w-4" />
              <span>Custos Fixos</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/frequencia'))}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-fuchsia-600/20 aria-selected:text-fuchsia-400"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Frequência</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/relatorio'))}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-fuchsia-600/20 aria-selected:text-fuchsia-400"
            >
              <FileText className="h-4 w-4" />
              <span>Relatório Mensal</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}
