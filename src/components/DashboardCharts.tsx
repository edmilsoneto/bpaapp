'use client'

import { ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell, PieChart, Pie } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, Users, Wallet, AlertCircle } from 'lucide-react'

type DashboardChartsProps = {
  expected: number
  collected: number
  pending: number
  paidStudentsCount: number
  unpaidStudentsCount: number
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function DashboardCharts({ expected, collected, pending, paidStudentsCount, unpaidStudentsCount }: DashboardChartsProps) {
  const revenueData = [
    { name: 'Previsto', value: expected, fill: 'url(#colorExpected)' },
    { name: 'Arrecadado', value: collected, fill: 'url(#colorCollected)' },
    { name: 'Pendente', value: pending, fill: 'url(#colorPending)' }
  ]

  const totalStudents = paidStudentsCount + unpaidStudentsCount
  const paidPercentage = totalStudents > 0 ? Math.round((paidStudentsCount / totalStudents) * 100) : 0

  const studentStatusData = [
    { name: 'Pagos', value: paidStudentsCount, fill: '#10b981' },
    { name: 'Não Pagos', value: unpaidStudentsCount, fill: '#ef4444' }
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-7">
      <Card className="overflow-hidden border-white/10 bg-neutral-950/60 backdrop-blur-xl shadow-2xl hover:scale-[1.01] transition-transform duration-300 xl:col-span-4">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
            <Wallet className="h-5 w-5 text-indigo-400" />
            Balanço Financeiro
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Resumo de receitas do mês atual
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 sm:mb-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
              <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1">Previsto</p>
              <p className="text-base font-bold text-indigo-400 sm:text-lg">{formatCurrency(expected)}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
              <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" /> Arrecadado</p>
              <p className="text-base font-bold text-emerald-500 sm:text-lg">{formatCurrency(collected)}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
              <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3 text-rose-500" /> Pendente</p>
              <p className="text-base font-bold text-rose-500 sm:text-lg">{formatCurrency(pending)}</p>
            </div>
          </div>
          
          <div className="h-[220px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#262626" vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} width={44} />
                <Tooltip
                  cursor={{ fill: '#262626', opacity: 0.4 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Valor']}
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden border-white/10 bg-neutral-950/60 backdrop-blur-xl shadow-2xl hover:scale-[1.01] transition-transform duration-300 xl:col-span-3">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
            <Users className="h-5 w-5 text-emerald-400" />
            Status dos Alunos
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Adesão de pagamentos no mês
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center p-4 sm:p-6">
          <div className="relative mb-4 h-[200px] w-full sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} aluno(s)`, 'Quantidade']}
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Pie
                  data={studentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {studentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Inner Text for Donut Chart */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white sm:text-3xl">{paidPercentage}%</span>
              <span className="text-xs text-neutral-400">Pagos</span>
            </div>
          </div>
          
          <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Pagos
              </span>
              <span className="text-2xl font-bold text-emerald-500">{paidStudentsCount}</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-xs text-rose-400 mb-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> Pendentes
              </span>
              <span className="text-2xl font-bold text-rose-500">{unpaidStudentsCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
