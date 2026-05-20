'use client'
import Skeleton from '@/components/ui/skeleton'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Eye, UploadCloud } from 'lucide-react'
import { generateMonthOptions, formatMonth, parseMonthString } from '@/lib/date-utils'
import type { Payment, PaymentStatus } from '@/lib/types'

const DEFAULT_MONTH_RANGE = 6

export default function CobrancasPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

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
        p.studentId === studentId ? { ...p, status: newStatus, paymentId: data.id, receiptUrl: data.receiptUrl } : p
      ))
    } else {
      alert('Erro ao atualizar pagamento')
      void loadPayments()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, paymentId: string | null | undefined, studentId: string) => {
    const file = e.target.files?.[0]
    if (!file || !paymentId) return

    setUploadingId(studentId)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('paymentId', paymentId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setPayments(payments => payments.map(p => 
          p.studentId === studentId ? { ...p, receiptUrl: data.receiptUrl } : p
        ))
      } else {
        alert('Erro ao enviar comprovante')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao enviar arquivo')
    } finally {
      setUploadingId(null)
    }
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
                <TableHead>Comprovante PIX</TableHead>
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
                      {payment.status === 'PAID' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, payment.paymentId, payment.studentId)}
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[payment.studentId] = el;
                            }}
                          />
                          
                          {payment.receiptUrl ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const receiptUrl = payment.receiptUrl
                                  if (receiptUrl) {
                                    window.open(receiptUrl, '_blank')
                                  }
                                }}
                                className="h-8 px-2"
                              >
                                <Eye className="w-4 h-4 mr-1 text-fuchsia-600" /> Ver PIX
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => fileInputRefs.current[payment.studentId]?.click()}
                                className="h-8 px-2 text-xs text-neutral-500"
                              >
                                Alterar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={uploadingId === payment.studentId || !payment.paymentId}
                              onClick={() => fileInputRefs.current[payment.studentId]?.click()}
                              className="h-8 px-2 border-dashed border-fuchsia-300 text-fuchsia-600"
                            >
                              <UploadCloud className="w-4 h-4 mr-1" />
                              {uploadingId === payment.studentId ? 'Enviando...' : 'Anexar PIX'}
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={payment.status === 'PAID'}
                        onCheckedChange={() => togglePaymentStatus(payment.studentId, payment.status, payment.monthlyFee)}
                        className={`data-[state=checked]:bg-pink-600`}
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
