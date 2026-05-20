'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export function PrintReportButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button
      onClick={handlePrint}
      className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium shadow-md print:hidden"
    >
      <FileDown className="w-4 h-4 mr-2" /> Gerar Relatório (PDF)
    </Button>
  )
}
