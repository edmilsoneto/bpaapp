import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { month } = body;

    if (!month) {
      return NextResponse.json({ error: 'Mês não fornecido' }, { status: 400 });
    }

    // 1. Calcular o Total Arrecadado
    const payments = await prisma.payment.findMany({
      where: { month, status: 'PAID' },
    });
    const totalCollected = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);

    // 2. Calcular o Total de Custos Pagos
    const costPayments = await prisma.costPayment.findMany({
      where: { month, status: 'PAID' },
    });
    const paidCosts = costPayments.reduce((acc, curr) => acc + curr.value, 0);

    // 3. Calcular Saldo Líquido
    const netBalance = totalCollected - paidCosts;

    // 4. Adicionar ao Caixa da Equipe (se houver saldo positivo)
    if (netBalance > 0) {
      let caixaGoal = await prisma.goal.findFirst({
        where: { title: 'Caixa da Equipe' },
      });

      if (!caixaGoal) {
        caixaGoal = await prisma.goal.create({
          data: {
            title: 'Caixa da Equipe',
            targetAmount: 5000, // Um alvo genérico
            currentAmount: 0,
          },
        });
      }

      await prisma.goal.update({
        where: { id: caixaGoal.id },
        data: {
          currentAmount: caixaGoal.currentAmount + netBalance,
        },
      });
    }

    // 5. Calcular qual será o próximo mês
    const [mStr, yStr] = month.split('/');
    let nextMonthNumber = parseInt(mStr) + 1;
    let nextYearNumber = parseInt(yStr);

    if (nextMonthNumber > 12) {
      nextMonthNumber = 1;
      nextYearNumber += 1;
    }

    const nextMonth = `${String(nextMonthNumber).padStart(2, '0')}/${nextYearNumber}`;

    // Não apagamos nenhum dado para manter o histórico!
    return NextResponse.json({ 
      message: 'Mês encerrado com sucesso', 
      closedMonth: month,
      nextMonth 
    });
  } catch (error) {
    console.error('Erro ao encerrar mês:', error);
    return NextResponse.json({ error: 'Falha ao encerrar mês' }, { status: 500 });
  }
}
