"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PrintReportButton } from '@/components/PrintReportButton';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CloseMonthButton({ currentMonth }: { currentMonth?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCloseMonth = async () => {
    if (!currentMonth) return;
    if (!password) {
      toast.error('Digite a senha para confirmar.')
      return;
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/closeMonth', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth, password })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.nextMonth) {
          router.push(`/?month=${encodeURIComponent(data.nextMonth)}`)
        } else {
          router.push('/')
        }
        router.refresh()
        setOpen(false)
        setPassword('')
        toast.success(`Mês ${currentMonth} encerrado com sucesso!`)
      } else {
        if (res.status === 403) {
          toast.error('Senha incorreta!')
        } else {
          toast.error('Erro ao encerrar mês')
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao encerrar mês')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <PrintReportButton currentMonth={currentMonth} />
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button aria-label="Encerrar mês">Encerrar Mês</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar o Mês de {currentMonth}?</DialogTitle>
            <DialogDescription>
              Esta ação transfere o saldo líquido atual (arrecadação - custos pagos) para a meta &quot;Caixa da Equipe&quot; e avança o painel para o próximo mês. 
              <br/><br/>
              Digite a senha de administrador para confirmar:
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input 
              type="password" 
              placeholder="Digite a senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
            <Button variant="default" onClick={handleCloseMonth} disabled={loading || !password}>
              {loading ? 'Encerrando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
