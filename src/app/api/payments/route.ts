import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    
    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    const students = await prisma.student.findMany({
      where: { 
        isActive: true,
        monthlyFee: { gt: 0 }
      },
      orderBy: { name: 'asc' }
    })

    const payments = await prisma.payment.findMany({
      where: { month }
    })

    // Map students to their payment status for the requested month
    const studentPayments = students.map(student => {
      const payment = payments.find(p => p.studentId === student.id)
      return {
        studentId: student.id,
        studentName: student.name,
        studentPhone: student.phone,
        monthlyFee: student.monthlyFee,
        status: payment ? payment.status : 'PENDING',
        paymentId: payment ? payment.id : null,
        paidAt: payment ? payment.paidAt : null,
        receiptUrl: payment ? payment.receiptUrl : null
      }
    })

    return NextResponse.json(studentPayments)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
