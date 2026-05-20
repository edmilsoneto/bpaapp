"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PrintReportButton } from '@/components/PrintReportButton';

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
      } else {
        alert('Erro ao encerrar mês')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao encerrar mês')
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
