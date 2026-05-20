import { addMonths, format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { MonthOption } from './types'

export function formatMonth(date: Date) {
  return format(date, 'MM/yyyy')
}

export function formatMonthLabel(date: Date) {
  const label = format(date, 'MMMM yyyy', { locale: ptBR })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function parseMonthString(value: string) {
  const [month, year] = value.split('/')
  return new Date(Number(year), Number(month) - 1, 1)
}

export function generateMonthOptions(range = 6): MonthOption[] {
  const now = new Date()
  const options: MonthOption[] = []

  for (let offset = -range; offset <= range; offset++) {
    const date = offset < 0 ? subMonths(now, Math.abs(offset)) : addMonths(now, offset)
    options.push({
      value: formatMonth(date),
      label: formatMonthLabel(date),
    })
  }

  return options
}
