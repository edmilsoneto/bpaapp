import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const paymentId = formData.get('paymentId') as string | null

    if (!file || !paymentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload to Vercel Blob Storage
    const blob = await put(`receipts/${paymentId}_${Date.now()}_${file.name}`, file, {
      access: 'public',
    })

    // Update payment in database with the blob URL
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { receiptUrl: blob.url }
    })

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 })
  }
}
