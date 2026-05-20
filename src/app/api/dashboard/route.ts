import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // e.g. "05/2026"
    
    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    const students = await prisma.student.findMany({
      where: { isActive: true }
    })
    const totalExpected = students.reduce((acc, curr) => acc + curr.monthlyFee, 0)

    const payments = await prisma.payment.findMany({
      where: { month }
    })

    const totalCollected = payments
      .filter(p => p.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amountPaid, 0)

    const totalPending = totalExpected - totalCollected

    // Last 6 months for chart
    const [m, y] = month.split('/')
    const currentMonth = parseInt(m)
    const currentYear = parseInt(y)
    
    const last6MonthsData = []
    for (let i = 5; i >= 0; i--) {
      let calcMonth = currentMonth - i
      let calcYear = currentYear
      if (calcMonth <= 0) {
        calcMonth += 12
        calcYear -= 1
      }
      
      const mStr = String(calcMonth).padStart(2, '0') + '/' + calcYear
      
      const monthPayments = await prisma.payment.findMany({
        where: { month: mStr, status: 'PAID' }
      })
      
      const sum = monthPayments.reduce((a, b) => a + b.amountPaid, 0)
      last6MonthsData.push({
        name: String(calcMonth).padStart(2, '0') + '/' + String(calcYear).slice(-2),
        total: sum
      })
    }

    const trainingDaysCount = await prisma.trainingDay.count({ where: { month } })
    const FIXED_COSTS = 650.00 + (trainingDaysCount * 60)
    const costPayments = await prisma.costPayment.findMany({
      where: { month }
    })
    const paidCosts = costPayments
      .filter(p => p.status === 'PAID')
      .reduce((acc, curr) => acc + curr.value, 0)

    return NextResponse.json({
      expected: totalExpected,
      collected: totalCollected,
      pending: totalPending > 0 ? totalPending : 0,
      totalCosts: FIXED_COSTS,
      paidCosts: paidCosts,
      chartData: last6MonthsData,
      doughnutData: [
        { name: 'Pago', value: totalCollected, fill: 'var(--color-pago)' },
        { name: 'Pendente', value: totalPending > 0 ? totalPending : 0, fill: 'var(--color-pendente)' }
      ]
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
