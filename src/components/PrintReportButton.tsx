'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function PrintReportButton({ currentMonth }: { currentMonth?: string }) {
  const [loading, setLoading] = useState(false)

  const handleGeneratePDF = async () => {
    if (!currentMonth) {
      toast.error('Nenhum mês selecionado')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/reports?month=${encodeURIComponent(currentMonth)}`)
      if (!res.ok) throw new Error('Erro ao buscar dados')
      
      const data = await res.json()
      
      // Cria o documento PDF (formato A4)
      const doc = new jsPDF()
      
      // Título
      doc.setFontSize(20)
      doc.setTextColor(40, 40, 40)
      doc.text(`Relatório Financeiro BPA 3x3`, 14, 22)
      
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Mês de Referência: ${data.month}`, 14, 30)
      
      // Resumo Financeiro
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Resumo Financeiro', 14, 45)

      autoTable(doc, {
        startY: 50,
        head: [['Arrecadado', 'Pendente', 'Custos Pagos', 'Saldo Líquido']],
        body: [
          [
            `R$ ${data.collected.toFixed(2)}`,
            `R$ ${data.pending.toFixed(2)}`,
            `R$ ${data.paidCosts.toFixed(2)}`,
            `R$ ${data.netBalance.toFixed(2)}`
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] } // Purple
      })

      // Mensalidades
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY1 = (doc as any).lastAutoTable?.finalY || 50
      doc.text('Lista de Mensalidades', 14, finalY1 + 15)

      autoTable(doc, {
        startY: finalY1 + 20,
        head: [['Atleta', 'Valor', 'Status']],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: data.payments.map((p: any) => [
          p.name,
          `R$ ${p.amount.toFixed(2)}`,
          p.status === 'PAID' ? 'Pago' : 'Pendente'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] } // Emerald
      })

      // Custos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY2 = (doc as any).lastAutoTable?.finalY || finalY1 + 20
      doc.text('Custos Fixos', 14, finalY2 + 15)

      autoTable(doc, {
        startY: finalY2 + 20,
        head: [['Despesa', 'Valor', 'Status']],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: data.costs.map((c: any) => [
          c.name,
          `R$ ${c.value.toFixed(2)}`,
          c.status === 'PAID' ? 'Pago' : 'Pendente'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [244, 63, 94] } // Rose
      })

      doc.save(`Relatorio_BPA_Mes_${data.month.replace('/', '-')}.pdf`)
      toast.success('PDF Gerado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Falha ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={loading || !currentMonth}
      className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium shadow-md print:hidden"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      Gerar Relatório (PDF)
    </Button>
  )
}
