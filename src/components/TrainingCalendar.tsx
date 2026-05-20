'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { generateMonthOptions, formatMonth, parseMonthString } from '@/lib/date-utils'
import type { TrainingDay } from '@/lib/types'

const DEFAULT_MONTH_RANGE = 6
const TRAINING_COST_PER_DAY = 60

export function TrainingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([])
  const [loading, setLoading] = useState(true)
  const [savingDay, setSavingDay] = useState<number | null>(null)

  const months = useMemo(() => generateMonthOptions(DEFAULT_MONTH_RANGE), [])
  const currentMonthStr = useMemo(() => formatMonth(currentDate), [currentDate])
  const activeDays = useMemo(
    () => new Set(trainingDays.map((day) => day.day)),
    [trainingDays]
  )

  const daysInMonth = useMemo(() => {
    const monthIndex = currentDate.getMonth()
    const year = currentDate.getFullYear()
    return new Date(year, monthIndex + 1, 0).getDate()
  }, [currentDate])

  const loadTrainingDays = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trainingDays?month=${encodeURIComponent(currentMonthStr)}`)
      if (res.ok) {
        setTrainingDays(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [currentMonthStr])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTrainingDays()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadTrainingDays])

  const toggleDay = async (day: number) => {
    const shouldActivate = !activeDays.has(day)
    setSavingDay(day)

    try {
      const res = await fetch('/api/trainingDays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: currentMonthStr,
          day,
          active: shouldActivate
        })
      })

      if (res.ok) {
        setTrainingDays(await res.json())
      } else {
        console.error('Failed to update training day')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSavingDay(null)
    }
  }

  const totalDays = activeDays.size
  const totalCost = totalDays * TRAINING_COST_PER_DAY

  const calendarDays = useMemo(() => {
    const monthIndex = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1
      const date = new Date(year, monthIndex, day)
      const dayOfWeek = date.getDay()
      const isTrainingDay = dayOfWeek === 2 || dayOfWeek === 4
      return { day, dayOfWeek, isCurrentMonth: true, isTrainingDay }
    })

    const blankDays = Array.from({ length: new Date(year, monthIndex, 1).getDay() })

    return [...blankDays.map((_, index) => ({ day: index, dayOfWeek: -1, isCurrentMonth: false, isTrainingDay: false })), ...days]
  }, [currentDate, daysInMonth])

  return (
    <Card className="w-full h-full min-h-[380px] bg-neutral-950 border-neutral-900 text-white">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-lg">Calendário de Treino</CardTitle>
          <p className="text-sm text-neutral-400">Somente terças e quintas podem ser marcadas como treino.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="text-sm text-neutral-300">
            {totalDays} dia(s) • R$ {totalCost.toFixed(2)}
          </div>
          <div className="w-full sm:w-52">
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
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((weekday) => (
            <div key={weekday} className="py-2">
              {weekday}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-10 text-center text-neutral-500">Carregando treinos...</div>
        ) : (
          <div className="mt-2 grid grid-cols-7 gap-2 text-center">
            {calendarDays.map((calendarItem, index) => {
              const isSelected = activeDays.has(calendarItem.day)
              const isAllowed = calendarItem.isCurrentMonth && calendarItem.isTrainingDay
              return (
                <Button
                  key={`${calendarItem.day}-${index}`}
                  variant={isSelected ? 'secondary' : 'outline'}
                  className={`min-h-[54px] rounded-md border px-0 py-3 text-sm font-medium transition-colors duration-200 ${
                    !calendarItem.isCurrentMonth
                      ? 'cursor-default opacity-0'
                      : isSelected
                      ? '!bg-fuchsia-600 !text-white !border-fuchsia-600 hover:!bg-fuchsia-700'
                      : isAllowed
                      ? 'bg-neutral-900 hover:bg-neutral-800'
                      : 'cursor-not-allowed opacity-50 bg-neutral-950'
                  }`}
                  onClick={() => isAllowed && toggleDay(calendarItem.day)}
                  disabled={!isAllowed || savingDay === calendarItem.day}
                >
                  {calendarItem.isCurrentMonth ? calendarItem.day : ''}
                </Button>
              )
            })}
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-neutral-400">Dias marcados</p>
            <p className="text-xl font-semibold">{totalDays}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-400">Valor total</p>
            <p className="text-xl font-semibold">R$ {totalCost.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
