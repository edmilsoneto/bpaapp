import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(students)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, monthlyFee } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const student = await prisma.student.create({
      data: {
        name,
        monthlyFee: monthlyFee !== undefined ? parseFloat(monthlyFee) : 80.0
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
