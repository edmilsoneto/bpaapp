import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, month, status, monthlyFee } = body

    if (!studentId || !month || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        studentId,
        month
      }
    })

    if (existingPayment) {
      const updatedPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status,
          amountPaid: status === 'PAID' ? monthlyFee : 0,
          paidAt: status === 'PAID' ? new Date() : null
        }
      })
      return NextResponse.json(updatedPayment)
    } else {
      const newPayment = await prisma.payment.create({
        data: {
          studentId,
          month,
          amountPaid: monthlyFee,
          status,
          paidAt: status === 'PAID' ? new Date() : null
        }
      })
      return NextResponse.json(newPayment)
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to toggle payment status' }, { status: 500 })
  }
}
