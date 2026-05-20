import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(goals)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, targetAmount, currentAmount } = body

    if (!title || targetAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
