'use client'
import Skeleton from '@/components/ui/skeleton'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { generateMonthOptions, formatMonth, parseMonthString } from '@/lib/date-utils'
import type { Payment, PaymentStatus } from '@/lib/types'
import { toast } from 'sonner'

const DEFAULT_MONTH_RANGE = 6

export default function CobrancasPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const months = useMemo(() => generateMonthOptions(DEFAULT_MONTH_RANGE), [])
  const currentMonthStr = useMemo(() => formatMonth(currentDate), [currentDate])

  const fetchPayments = async (monthStr: string) => {
    setLoading(true)
    const res = await fetch(`/api/payments?month=${encodeURIComponent(monthStr)}`)
    if (res.ok) {
      setPayments(await res.json())
    }
    setLoading(false)
  }

  const loadPayments = useCallback(async () => {
    await fetchPayments(currentMonthStr)
  }, [currentMonthStr])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPayments()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadPayments])

  const togglePaymentStatus = async (studentId: string, currentStatus: PaymentStatus, monthlyFee: number) => {
    const newStatus: PaymentStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID'
    
    // Optimistic update
    setPayments((prevPayments) => prevPayments.map((p) => 
      p.studentId === studentId ? { ...p, status: newStatus } : p
    ))

    const res = await fetch('/api/payments/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        month: currentMonthStr,
        status: newStatus,
        monthlyFee
      })
    })

    if (res.ok) {
      const data = await res.json()
      setPayments((prevPayments) => prevPayments.map((p) => 
        p.studentId === studentId ? { ...p, status: newStatus, paymentId: data.id } : p
      ))
      toast.success('Pagamento atualizado com sucesso!')
    } else {
      toast.error('Erro ao atualizar pagamento')
      void loadPayments()
    }
  }

  const sendWhatsAppMessage = (phone: string, name: string, fee: number, month: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    let finalPhone = cleanPhone
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      finalPhone = `55${cleanPhone}`
    }
    const text = `Olá ${name}! A sua mensalidade de ${month} no valor de R$ ${fee.toFixed(2)} está pendente. A chave PIX é: edmilsoneto30@gmail.com`
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Controle de Mensalidades</h1>
        <div className="w-full sm:w-64">
          <Select 
            value={currentMonthStr} 
            onValueChange={(val) => {
              if (!val) return
              setCurrentDate(parseMonthString(val))
            }}
          >
            <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atleta</TableHead>
                <TableHead>Valor Mensalidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cobrança</TableHead>
                <TableHead className="text-right">Marcar Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6"><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-neutral-500">Nenhum atleta ativo encontrado.</TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.studentId} className="hover:bg-transparent transition-none">
                    <TableCell className="font-medium">{payment.studentName}</TableCell>
                    <TableCell>R$ {payment.monthlyFee.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'PAID' ? 'Pago' : 'Pendente'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.status === 'PENDING' && payment.studentPhone ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendWhatsAppMessage(payment.studentPhone!, payment.studentName, payment.monthlyFee, currentMonthStr)}
                          className="h-8 px-2 border-green-500/50 text-green-500 hover:bg-green-500/10"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      ) : (
                        <span className="text-xs text-neutral-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={payment.status === 'PAID'}
                        onCheckedChange={() => togglePaymentStatus(payment.studentId, payment.status, payment.monthlyFee)}
                        className="data-checked:!bg-fuchsia-600"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
