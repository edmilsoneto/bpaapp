import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');

  if (!month) {
    return NextResponse.json({ error: 'Mês não fornecido' }, { status: 400 });
  }

  try {
    // 1. Get Payments (and Students)
    const payments = await prisma.payment.findMany({
      where: { month },
      include: { student: true }
    });

    const expected = payments.reduce((acc, curr) => acc + (curr.student?.monthlyFee || 80), 0);
    const collected = payments.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + curr.amountPaid, 0);
    const pending = expected - collected;

    // 2. Get Costs
    const costPayments = await prisma.costPayment.findMany({
      where: { month }
    });
    
    const paidCosts = costPayments.filter(c => c.status === 'PAID').reduce((acc, curr) => acc + curr.value, 0);

    // 3. Get Attendances / Ranking (simplified)
    // For the report, maybe we just list top attendees? 
    // Just get total days to put in report
    const trainingDays = await prisma.trainingDay.findMany({
      where: { month }
    });

    return NextResponse.json({
      month,
      expected,
      collected,
      pending,
      paidCosts,
      netBalance: collected - paidCosts,
      payments: payments.map(p => ({
        name: p.student.name,
        amount: p.amountPaid || p.student.monthlyFee,
        status: p.status
      })),
      costs: costPayments.map(c => ({
        name: c.name,
        value: c.value,
        status: c.status
      })),
      trainingDaysCount: trainingDays.length
    });
  } catch (error) {
    console.error('Error generating report data:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
