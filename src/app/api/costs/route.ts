import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const OTHER_FIXED_COSTS = [
  { name: 'Sampaio', value: 500.00 },
  { name: 'Ed', value: 100.00 },
  { name: 'Fátima', value: 50.00 },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    
    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    const trainingDaysCount = await prisma.trainingDay.count({
      where: { month }
    })
    
    const quadraCost = { name: 'Quadra', value: trainingDaysCount * 60 }
    const ALL_COSTS = [quadraCost, ...OTHER_FIXED_COSTS]

    const costPayments = await prisma.costPayment.findMany({
      where: { month }
    })

    const costs = ALL_COSTS.map(cost => {
      const payment = costPayments.find(p => p.name === cost.name)
      return {
        name: cost.name,
        value: cost.value, // Sempre usa o valor calculado mais recente (ex: atualiza se marcar mais dias)
        status: payment ? payment.status : 'PENDING',
      }
    })

    return NextResponse.json(costs)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch costs' }, { status: 500 })
  }
}
