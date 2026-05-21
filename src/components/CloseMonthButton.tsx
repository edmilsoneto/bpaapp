"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PrintReportButton } from '@/components/PrintReportButton';
import { toast } from 'sonner';

export default function CloseMonthButton({ currentMonth }: { currentMonth?: string }) {
  const router = useRouter()

  const handleCloseMonth = async () => {
    if (!currentMonth) return;
    
    if (!confirm(`Tem certeza que deseja encerrar o mês de ${currentMonth}? O saldo líquido será transferido para o Caixa da Equipe.`)) {
      return;
    }

    try {
      const res = await fetch('/api/closeMonth', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.nextMonth) {
          router.push(`/?month=${encodeURIComponent(data.nextMonth)}`)
        } else {
          router.push('/')
        }
        router.refresh()
        toast.success(`Mês ${currentMonth} encerrado com sucesso!`)
      } else {
        toast.error('Erro ao encerrar mês')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao encerrar mês')
    }
  }

  return (
    <div className="flex gap-2">
      <PrintReportButton />
      <Button onClick={handleCloseMonth} aria-label="Encerrar mês">
        Encerrar Mês
      </Button>
    </div>
  );
}
