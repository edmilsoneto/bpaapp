import CloseMonthButton from '@/components/CloseMonthButton'
import { DashboardCharts } from '@/components/DashboardCharts'
import { DashboardGoals } from '@/components/DashboardGoals'
import { TrainingCalendar } from '@/components/TrainingCalendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface DashboardData {
  expected: number
  collected: number
  pending: number
  totalCosts: number
  paidCosts: number
  paidStudentsCount: number
  unpaidStudentsCount: number
  currentMonth: string
}

async function getDashboardData(monthParam?: string): Promise<DashboardData | null> {
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

    const payments = await prisma.payment.findMany({
      where: { month }
    })

    const paidStudentIds = new Set(payments.filter((p) => p.status === 'PAID').map((p) => p.studentId))
    const paidStudentsCount = paidStudentIds.size
    const unpaidStudentsCount = Math.max(students.length - paidStudentsCount, 0)

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
      unpaidStudentsCount,
      currentMonth: month,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const params = await searchParams
  const data = await getDashboardData(params.month)

  if (!data) {
    return <div className="text-red-500">Erro ao carregar dados do dashboard. Certifique-se de que o banco de dados está sincronizado.</div>
  }

  return (
    <main className="relative z-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard Financeiro</h1>
        <CloseMonthButton currentMonth={data.currentMonth} />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="h-full bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white hover:scale-[1.02] transition-all duration-300 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white sm:text-3xl">
              R$ {data.expected.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">Soma das mensalidades</p>
          </CardContent>
        </Card>
        <Card className="h-full bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white hover:scale-[1.02] transition-all duration-300 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 sm:text-3xl">
              R$ {data.collected.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">Recebido este mês</p>
          </CardContent>
        </Card>
        <Card className="h-full bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white hover:scale-[1.02] transition-all duration-300 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Pagos / Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-500 sm:text-3xl">
              R$ {data.paidCosts.toFixed(2)} / R$ {data.totalCosts.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">Sampaio, Quadra, etc.</p>
          </CardContent>
        </Card>
        <Card className="h-full bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white hover:scale-[1.02] transition-all duration-300 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido (Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold sm:text-3xl ${data.collected - data.paidCosts >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              R$ {(data.collected - data.paidCosts).toFixed(2)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">Arrecadado - Custos Pagos</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <DashboardCharts
          expected={data.expected}
          collected={data.collected}
          pending={data.pending}
          paidStudentsCount={data.paidStudentsCount}
          unpaidStudentsCount={data.unpaidStudentsCount}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6 items-stretch">
        <div className="grid gap-6">
          <TrainingCalendar />
        </div>

        <div className="h-full">
          <DashboardGoals />
        </div>
      </div>
    </main>
  )
}
