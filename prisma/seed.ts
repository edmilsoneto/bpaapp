import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.payment.deleteMany()
  await prisma.student.deleteMany()

  // Create Students
  const kayo = await prisma.student.create({
    data: {
      name: 'Kayo',
      monthlyFee: 20.0,
      isActive: true,
    },
  })

  const student1 = await prisma.student.create({
    data: {
      name: 'João Pedro',
      monthlyFee: 80.0,
      isActive: true,
    },
  })

  const student2 = await prisma.student.create({
    data: {
      name: 'Lucas Silva',
      monthlyFee: 80.0,
      isActive: true,
    },
  })
  
  const student3 = await prisma.student.create({
    data: {
      name: 'Mateus Costa',
      monthlyFee: 80.0,
      isActive: true,
    },
  })

  console.log('Created students')

  // Generate some payments for the last 6 months
  const now = new Date()
  const students = [kayo, student1, student2, student3]

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

    for (const student of students) {
      // Simulate some pending payments (e.g., student3 is pending for current month, others paid)
      let status = 'PAID'
      let paidAt: Date | null = new Date(d.getFullYear(), d.getMonth(), 15)

      if (i === 0 && student.name === 'Mateus Costa') {
        status = 'PENDING'
        paidAt = null
      }
      if (i === 1 && student.name === 'Lucas Silva') {
        status = 'PENDING'
        paidAt = null
      }

      await prisma.payment.create({
        data: {
          studentId: student.id,
          month: monthStr,
          amountPaid: student.monthlyFee,
          status: status,
          paidAt: paidAt,
        },
      })
    }
  }

  console.log('Created payments')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
