import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, monthlyFee, isActive } = body

    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        monthlyFee: monthlyFee !== undefined ? parseFloat(monthlyFee) : undefined,
        isActive
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.student.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
