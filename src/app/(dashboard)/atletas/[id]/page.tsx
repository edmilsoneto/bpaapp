import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AthleteProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { month: 'desc' } },
      attendances: { 
        include: { trainingDay: true }, 
        orderBy: { trainingDay: { date: 'desc' } } 
      }
    }
  })

  if (!student) {
    return <div className="text-white">Atleta não encontrado.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/atletas" className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl flex items-center gap-3">
            {student.name}
            {student.monthlyFee === 0 && (
              <Badge variant="outline" className="border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0 h-6 text-xs uppercase tracking-wider">
                Bolsista
              </Badge>
            )}
          </h1>
          <p className="text-sm text-neutral-400">Perfil e Histórico</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Mensalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {student.monthlyFee.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Telefone / WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{student.phone || 'Não informado'}</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {student.isActive ? (
              <Badge className="bg-green-100 text-green-800 text-sm hover:bg-green-100">Ativo</Badge>
            ) : (
              <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-sm hover:bg-neutral-800">Inativo</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Mensalidades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead>Mês</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.payments.length === 0 ? (
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center py-6 text-neutral-500">Nenhum pagamento registrado.</TableCell>
                  </TableRow>
                ) : (
                  student.payments.map((payment) => (
                    <TableRow key={payment.id} className="border-neutral-800 hover:bg-transparent">
                      <TableCell className="font-medium">{payment.month}</TableCell>
                      <TableCell>R$ {payment.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'PAID' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Presença</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead>Data</TableHead>
                  <TableHead>Mês Ref.</TableHead>
                  <TableHead className="text-right">Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.attendances.length === 0 ? (
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center py-6 text-neutral-500">Nenhuma chamada registrada.</TableCell>
                  </TableRow>
                ) : (
                  student.attendances.map((att) => (
                    <TableRow key={att.id} className="border-neutral-800 hover:bg-transparent">
                      <TableCell className="font-medium">{new Date(att.trainingDay.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{att.trainingDay.month}</TableCell>
                      <TableCell className="text-right">
                        {att.isPresent ? (
                          <span className="text-green-500 font-medium">Presente</span>
                        ) : (
                          <span className="text-red-500 font-medium">Falta</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
