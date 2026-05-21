import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ReportData {
  expected: number
  collected: number
  pending: number
  totalCosts: number
  paidCosts: number
  paidStudentsCount: number
  totalStudentsCount: number
  currentMonth: string
}

async function getReportData(monthParam?: string): Promise<ReportData | null> {
  try {
    let month = monthParam
    if (!month) {
      const d = new Date()
      month = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    }
    
    const students = await prisma.student.findMany({
      where: { isActive: true }
    })
    const totalExpected = students.reduce((acc, curr) => acc + curr.monthlyFee, 0)
    const totalStudentsCount = students.length

    const payments = await prisma.payment.findMany({
      where: { month }
    })

    const paidStudentIds = new Set(payments.filter((p) => p.status === 'PAID').map((p) => p.studentId))
    const paidStudentsCount = paidStudentIds.size

    const totalCollected = payments
      .filter(p => p.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amountPaid, 0)

    const totalPending = totalExpected - totalCollected

    const trainingDaysCount = await prisma.trainingDay.count({ where: { month } })
    const FIXED_COSTS = 650.00 + (trainingDaysCount * 60)
    const costPayments = await prisma.costPayment.findMany({
      where: { month }
    })
    const paidCosts = costPayments
      .filter(p => p.status === 'PAID')
      .reduce((acc, curr) => acc + curr.value, 0)

    return {
      expected: totalExpected,
      collected: totalCollected,
      pending: totalPending > 0 ? totalPending : 0,
      totalCosts: FIXED_COSTS,
      paidCosts: paidCosts,
      paidStudentsCount,
      totalStudentsCount,
      currentMonth: month,
    }
  } catch (error) {
    console.error('Error fetching report data:', error)
    return null
  }
}

export default async function RelatorioPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const params = await searchParams
  const data = await getReportData(params.month)

  if (!data) {
    return <div className="text-red-500">Erro ao carregar os dados do relatório.</div>
  }

  const netBalance = data.collected - data.paidCosts
  const isPositive = netBalance >= 0
  const collectionRate = data.totalStudentsCount > 0 ? Math.round((data.paidStudentsCount / data.totalStudentsCount) * 100) : 0

  return (
    <main className="relative z-10 w-full max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-fuchsia-500" />
            Relatório Mensal
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Pronto para capturar a tela ou imprimir.</p>
        </div>
        
        {/* Simple client-side print button using regular HTML print */}
        <button 
          className="flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-700 w-fit"
          // We can't use onClick in a server component easily without a client wrapper, 
          // but we can use a small inline script or just rely on the user pressing Ctrl+P.
          // For a perfect UX, we'll just advise them to Ctrl+P or we can make a tiny Client Component if needed.
        >
          <Download className="h-4 w-4" />
          <span>Salvar PDF (Ctrl+P)</span>
        </button>
      </div>

      {/* Printable Area */}
      <div id="relatorio-print" className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl print:shadow-none print:border-none print:bg-white print:text-black">
        <div className="text-center mb-8 border-b border-neutral-800 pb-6 print:border-gray-200">
          <h2 className="text-3xl font-black text-white print:text-black tracking-tight">BPA 3x3</h2>
          <p className="text-lg text-fuchsia-400 font-medium print:text-gray-600">Fechamento: {data.currentMonth}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          <Card className="bg-neutral-900/50 border-neutral-800 print:bg-gray-50 print:border-gray-200 print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400 print:text-gray-500">Total Arrecadado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white print:text-black">R$ {data.collected.toFixed(2)}</div>
              <div className="text-xs text-neutral-500 mt-1 print:text-gray-400">De R$ {data.expected.toFixed(2)} previstos</div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 print:bg-gray-50 print:border-gray-200 print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400 print:text-gray-500">Custos Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white print:text-black">R$ {data.paidCosts.toFixed(2)}</div>
              <div className="text-xs text-neutral-500 mt-1 print:text-gray-400">De R$ {data.totalCosts.toFixed(2)} previstos</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          <div className="flex flex-col justify-center items-center p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl print:bg-gray-50 print:border-gray-200">
            <p className="text-sm font-medium text-neutral-400 mb-2 print:text-gray-500">Taxa de Pagamento</p>
            <div className="text-5xl font-black text-fuchsia-500 print:text-black">{collectionRate}%</div>
            <p className="text-xs text-neutral-500 mt-2 print:text-gray-400">{data.paidStudentsCount} de {data.totalStudentsCount} atletas pagos</p>
          </div>

          <div className="flex flex-col justify-center items-center p-6 bg-neutral-900/50 border border-neutral-800 rounded-xl print:bg-gray-50 print:border-gray-200">
             <p className="text-sm font-medium text-neutral-400 mb-2 print:text-gray-500">Saldo Líquido</p>
             <div className={`text-5xl font-black ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                R$ {netBalance.toFixed(2)}
             </div>
             <p className="text-xs text-neutral-500 mt-2 print:text-gray-400">Caixa final do mês</p>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 mt-12 print:text-gray-400">
          Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} pelo Sistema de Gestão BPA 3x3.
        </div>
      </div>
    </main>
  )
}
