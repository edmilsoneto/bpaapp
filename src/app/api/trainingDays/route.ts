import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isValidTrainingDay(month: string, day: number) {
  const [rawMonth, rawYear] = month.split('/')
  const monthNumber = Number(rawMonth)
  const yearNumber = Number(rawYear)

  if (Number.isNaN(monthNumber) || Number.isNaN(yearNumber) || monthNumber < 1 || monthNumber > 12) {
    return false
  }

  const date = new Date(yearNumber, monthNumber - 1, day)
  const dayOfWeek = date.getDay()
  return dayOfWeek === 2 || dayOfWeek === 4
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    const trainingDays = await prisma.trainingDay.findMany({
      where: { month },
      orderBy: { day: 'asc' }
    })

    const validTrainingDays = trainingDays.filter((item) => isValidTrainingDay(item.month, item.day))

    return NextResponse.json(validTrainingDays)
  } catch (error) {
    console.error('Failed to load training days:', error)
    return NextResponse.json({ error: 'Failed to load training days' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { month, day, active } = body

    if (!month || day === undefined || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isValidTrainingDay(month, day)) {
      return NextResponse.json({ error: 'Only Tuesdays and Thursdays can be selected' }, { status: 400 })
    }

    const [rawMonth, rawYear] = month.split('/')
    const monthNumber = Number(rawMonth)
    const yearNumber = Number(rawYear)

    if (Number.isNaN(monthNumber) || Number.isNaN(yearNumber) || monthNumber < 1 || monthNumber > 12) {
      return NextResponse.json({ error: 'Invalid month format' }, { status: 400 })
    }

    const existingDay = await prisma.trainingDay.findFirst({
      where: { month, day }
    })

    if (active) {
      if (!existingDay) {
        await prisma.trainingDay.create({
          data: {
            month,
            day,
            date: new Date(yearNumber, monthNumber - 1, day)
          }
        })
      }
    } else {
      if (existingDay) {
        await prisma.trainingDay.delete({
          where: { id: existingDay.id }
        })
      }
    }

    const trainingDays = await prisma.trainingDay.findMany({
      where: { month },
      orderBy: { day: 'asc' }
    })

    const validTrainingDays = trainingDays.filter((item) => isValidTrainingDay(item.month, item.day))

    return NextResponse.json(validTrainingDays)
  } catch (error) {
    console.error('Failed to update training days:', error)
    return NextResponse.json({ error: 'Failed to update training days' }, { status: 500 })
  }
}
