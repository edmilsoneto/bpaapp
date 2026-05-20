import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, month, status, value } = body

    if (!name || !month || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingCost = await prisma.costPayment.findFirst({
      where: {
        name,
        month
      }
    })

    if (existingCost) {
      const updatedCost = await prisma.costPayment.update({
        where: { id: existingCost.id },
        data: {
          status,
          value,
          paidAt: status === 'PAID' ? new Date() : null
        }
      })
      return NextResponse.json(updatedCost)
    } else {
      const newCost = await prisma.costPayment.create({
        data: {
          name,
          month,
          value,
          status,
          paidAt: status === 'PAID' ? new Date() : null
        }
      })
      return NextResponse.json(newCost)
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to toggle cost status' }, { status: 500 })
  }
}
