'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { formatMonth, generateMonthOptions, parseMonthString } from '@/lib/date-utils'
import { DollarSign, Receipt, Wallet, CheckCircle2, CircleDashed, Activity, MapPin, User, FileText } from 'lucide-react'
import type { Cost, PaymentStatus } from '@/lib/types'

const DEFAULT_MONTH_RANGE = 6

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const getCostIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('quadra')) return <MapPin className="w-5 h-5 text-emerald-400" />
  if (n.includes('sampaio') || n.includes('ed') || n.includes('fátima') || n.includes('fatima')) return <User className="w-5 h-5 text-indigo-400" />
  return <FileText className="w-5 h-5 text-fuchsia-400" />
}

export default function CustosPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)

  const months = useMemo(() => generateMonthOptions(DEFAULT_MONTH_RANGE), [])
  const currentMonthStr = useMemo(() => formatMonth(currentDate), [currentDate])

  const fetchCosts = async (monthStr: string) => {
    setLoading(true)
    const res = await fetch(`/api/costs?month=${encodeURIComponent(monthStr)}`)
    if (res.ok) {
      setCosts(await res.json())
    }
    setLoading(false)
  }

  const loadCosts = useCallback(async () => {
    await fetchCosts(currentMonthStr)
  }, [currentMonthStr])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCosts()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadCosts])

  const toggleCostStatus = async (name: string, currentStatus: PaymentStatus, value: number) => {
    const newStatus: PaymentStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID'
    
    setCosts((prevCosts) =>
      prevCosts.map((cost) =>
        cost.name === name ? { ...cost, status: newStatus } : cost
      )
    )

    const res = await fetch('/api/costs/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        month: currentMonthStr,
        status: newStatus,
        value
      })
    })

    if (!res.ok) {
      alert('Erro ao atualizar custo')
      fetchCosts(currentMonthStr)
    }
  }

  const totalCosts = costs.reduce((acc, curr) => acc + curr.value, 0)
  const totalPaid = costs.filter(c => c.status === 'PAID').reduce((acc, curr) => acc + curr.value, 0)
  const totalPending = totalCosts - totalPaid
  const progressPercentage = totalCosts > 0 ? Math.round((totalPaid / totalCosts) * 100) : 0

  return (
    <div className="space-y-8 pb-10">
      {/* Header and Month Selector */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
            <Wallet className="h-7 w-7 text-fuchsia-500 sm:h-8 sm:w-8" />
            Custos Fixos da Equipe
          </h1>
          <p className="text-neutral-400 mt-2">Gerencie as despesas mensais e acompanhe os pagamentos.</p>
        </div>
        <div className="w-full sm:w-64">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2 block">Mês de Referência</label>
          <Select 
            value={currentMonthStr} 
            onValueChange={(val) => {
              if (!val) return
              setCurrentDate(parseMonthString(val))
            }}
          >
            <SelectTrigger className="w-full bg-neutral-900/80 border-neutral-800 text-white h-12 shadow-sm rounded-xl focus:ring-fuchsia-500/50">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white rounded-xl">
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value} className="focus:bg-neutral-800 focus:text-white">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-24 h-24" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalCosts)}</div>
            <p className="text-xs text-neutral-500 mt-1">Soma de todas as despesas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 className="w-24 h-24 text-emerald-500" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-emerald-500/50 mt-1">Despesas já quitadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CircleDashed className="w-24 h-24 text-rose-500" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-500">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-rose-500/50 mt-1">Falta pagar este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="bg-neutral-950 border-neutral-900 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-neutral-900 bg-neutral-900/40 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <Receipt className="w-5 h-5 text-fuchsia-500" />
                Relação de Despesas
              </CardTitle>
              <CardDescription className="text-neutral-400 mt-1">Controle individual de pagamentos de fornecedores e taxas.</CardDescription>
            </div>
            {/* Progress Bar */}
            <div className="w-full space-y-2 sm:w-64">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-neutral-400">Progresso do Mês</span>
                <span className="text-emerald-500">{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <Activity className="w-8 h-8 animate-pulse text-fuchsia-500 mb-4" />
              <p>Carregando despesas...</p>
            </div>
          ) : costs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <CheckCircle2 className="w-12 h-12 text-neutral-700 mb-4" />
              <p>Nenhum custo cadastrado para este mês.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-900/50">
              {costs.map((cost) => (
                <div key={cost.name} className="p-4 sm:p-6 hover:bg-neutral-900/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 shadow-inner">
                      {getCostIcon(cost.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{cost.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${
                          cost.status === 'PAID' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {cost.status === 'PAID' ? 'Quitado' : 'Aguardando Pagamento'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-neutral-900/40 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-neutral-800 sm:border-transparent mt-2 sm:mt-0">
                    <div className="text-xl font-bold text-white tracking-tight">
                      {formatCurrency(cost.value)}
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 shadow-sm">
                      <span className="text-xs font-medium text-neutral-400">Pago?</span>
                      <Switch 
                        checked={cost.status === 'PAID'}
                        onCheckedChange={() => toggleCostStatus(cost.name, cost.status, cost.value)}
                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
