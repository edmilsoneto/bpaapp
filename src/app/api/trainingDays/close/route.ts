import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trainingDayId, isClosed } = body;

    if (!trainingDayId) {
      return NextResponse.json({ error: 'ID do dia de treino é obrigatório' }, { status: 400 });
    }

    const updatedDay = await prisma.trainingDay.update({
      where: { id: trainingDayId },
      data: { isClosed }
    });

    return NextResponse.json(updatedDay);
  } catch (error) {
    console.error('Erro ao encerrar/reabrir dia de treino:', error);
    return NextResponse.json({ error: 'Falha ao atualizar dia de treino' }, { status: 500 });
  }
}
