import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { currentAmount } = body

    if (currentAmount === undefined) {
      return NextResponse.json({ error: 'Missing currentAmount' }, { status: 400 })
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: { currentAmount: parseFloat(currentAmount) }
    })

    return NextResponse.json(updatedGoal)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    await prisma.goal.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
