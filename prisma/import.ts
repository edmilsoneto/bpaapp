import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const data = [
  { name: 'Gustavo Bola', fee: 40.00 },
  { name: 'João Guilherme Soares Mota', fee: 40.00 },
  { name: 'João Henrique', fee: 40.00 },
  { name: 'Kayo', fee: 20.00 },
  { name: 'Thyson', fee: 40.00 },
  { name: 'Vinicius Almeida (Mango)', fee: 40.00 },
  { name: 'Pedro igor', fee: 70.00 },
  { name: 'João G.Marciel', fee: 70.00 },
  { name: 'Davi (Nice)', fee: 40.00 },
  { name: 'Jefferson', fee: 70.00 },
  { name: 'Joabe Mãe ( valdirene )', fee: 40.00 },
  { name: 'Paulo Victor', fee: 40.00 },
  { name: 'Luis Eduardo', fee: 60.00 },
  { name: 'Pedro henrique', fee: 40.00 },
  { name: 'Gabriel Pereira Lisboa', fee: 80.00 },
  { name: 'Hyago Bessa de Oliveira Alves', fee: 80.00 },
  { name: 'Pedro Pereira Lisboa', fee: 80.00 },
  { name: 'wendrl bruno carneiro barbosa', fee: 80.00 },
  { name: 'Mateus', fee: 80.00 },
  { name: 'guilherme', fee: 80.00 },
  { name: 'Rômulo', fee: 80.00 },
  { name: 'jp', fee: 80.00 },
  { name: 'joao gabriel', fee: 80.00 }
]

async function main() {
  await prisma.payment.deleteMany()
  await prisma.student.deleteMany()

  const students = []
  for (const item of data) {
    const student = await prisma.student.create({
      data: {
        name: item.name,
        monthlyFee: item.fee,
        isActive: true,
      },
    })
    students.push(student)
  }

  console.log('Alunos importados com sucesso!')

  // Create fake payments for the last 6 months
  const now = new Date()
  
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

    for (const student of students) {
      // randomly pendency for some to make charts interesting
      let status = 'PAID'
      let paidAt: Date | null = new Date(d.getFullYear(), d.getMonth(), 15)

      // just some random logic for pending
      if (student.name.startsWith('J') && i === 0) {
        status = 'PENDING'
        paidAt = null
      }
      if (student.name === 'Kayo' && i === 1) {
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

  console.log('Pagamentos gerados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
