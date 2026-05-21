import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trainingDayId = searchParams.get('trainingDayId')
  const ranking = searchParams.get('ranking')
  const monthStr = searchParams.get('month')

  try {
    if (ranking === 'true' && monthStr) {
      // Get all training days for the month
      const trainingDays = await prisma.trainingDay.findMany({
        where: { month: monthStr },
        select: { id: true }
      })
      
      const totalDays = trainingDays.length
      if (totalDays === 0) {
        return NextResponse.json([])
      }

      const trainingDayIds = trainingDays.map(td => td.id)

      // Get all active students
      const students = await prisma.student.findMany({
        where: { isActive: true },
        select: { id: true, name: true }
      })

      // Get attendances for these days
      const attendances = await prisma.attendance.findMany({
        where: {
          trainingDayId: { in: trainingDayIds },
          isPresent: true,
        }
      })

      // Count attendances per student
      const counts: Record<string, number> = {}
      for (const att of attendances) {
        counts[att.studentId] = (counts[att.studentId] || 0) + 1
      }

      // Build ranking
      const rankingData = students.map(student => {
        const presenceCount = counts[student.id] || 0
        return {
          studentId: student.id,
          name: student.name,
          presenceCount,
          percentage: Math.round((presenceCount / totalDays) * 100)
        }
      }).sort((a, b) => b.presenceCount - a.presenceCount)

      return NextResponse.json(rankingData)
    }

    if (trainingDayId) {
      // Get attendance for a specific day
      const students = await prisma.student.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })

      const attendances = await prisma.attendance.findMany({
        where: { trainingDayId }
      })

      const attendanceMap = new Map(attendances.map(a => [a.studentId, a]))

      const result = students.map(student => {
        const att = attendanceMap.get(student.id)
        return {
          studentId: student.id,
          name: student.name,
          isPresent: att ? att.isPresent : false,
          attendanceId: att?.id || null
        }
      })

      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  } catch (error) {
    console.error('Error in attendance GET:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, trainingDayId, isPresent } = await request.json()

    if (!studentId || !trainingDayId || typeof isPresent !== 'boolean') {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_trainingDayId: {
          studentId,
          trainingDayId
        }
      },
      update: {
        isPresent
      },
      create: {
        studentId,
        trainingDayId,
        isPresent
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error in attendance POST:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
