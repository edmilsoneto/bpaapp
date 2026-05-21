'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { generateMonthOptions, formatMonth, parseMonthString } from '@/lib/date-utils'
import { CalendarCheck, Users, Activity, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import Skeleton from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const DEFAULT_MONTH_RANGE = 6

interface TrainingDay {
  id: string
  day: number
  date: string
}

interface StudentAttendance {
  studentId: string
  name: string
  isPresent: boolean
  attendanceId: string | null
}

interface RankingData {
  studentId: string
  name: string
  presenceCount: number
  percentage: number
}

export default function FrequenciaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([])
  const [selectedDayId, setSelectedDayId] = useState<string>('')
  
  const [attendances, setAttendances] = useState<StudentAttendance[]>([])
  const [ranking, setRanking] = useState<RankingData[]>([])
  const [loadingDays, setLoadingDays] = useState(true)
  const [loadingAtt, setLoadingAtt] = useState(false)

  const months = useMemo(() => generateMonthOptions(DEFAULT_MONTH_RANGE), [])
  const currentMonthStr = useMemo(() => formatMonth(currentDate), [currentDate])

  const loadRanking = useCallback(async () => {
    try {
      const res = await fetch(`/api/attendance?ranking=true&month=${encodeURIComponent(currentMonthStr)}`)
      if (res.ok) {
        setRanking(await res.json())
      }
    } catch (error) {
      console.error(error)
    }
  }, [currentMonthStr])

  const fetchTrainingDays = useCallback(async () => {
    setLoadingDays(true)
    try {
      const res = await fetch(`/api/trainingDays?month=${encodeURIComponent(currentMonthStr)}`)
      if (res.ok) {
        const days: TrainingDay[] = await res.json()
        setTrainingDays(days)
        if (days.length > 0) {
          setSelectedDayId(days[0].id)
        } else {
          setSelectedDayId('')
          setAttendances([])
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingDays(false)
    }
  }, [currentMonthStr])

  useEffect(() => {
    void fetchTrainingDays()
    void loadRanking()
  }, [fetchTrainingDays, loadRanking])

  const fetchAttendances = useCallback(async (dayId: string) => {
    if (!dayId) return
    setLoadingAtt(true)
    try {
      const res = await fetch(`/api/attendance?trainingDayId=${dayId}`)
      if (res.ok) {
        setAttendances(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingAtt(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDayId) {
      void fetchAttendances(selectedDayId)
    }
  }, [selectedDayId, fetchAttendances])

  const toggleAttendance = async (studentId: string, currentStatus: boolean) => {
    if (!selectedDayId) return
    const newStatus = !currentStatus

    // Optimistic UI update
    setAttendances(prev => prev.map(a => 
      a.studentId === studentId ? { ...a, isPresent: newStatus } : a
    ))

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          trainingDayId: selectedDayId,
          isPresent: newStatus
        })
      })

      if (!res.ok) {
        toast.error('Erro ao registrar presença')
        void fetchAttendances(selectedDayId) // revert
      } else {
        toast.success(`Presença de atualizada!`)
        void loadRanking() // refresh ranking on background
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao registrar presença')
      void fetchAttendances(selectedDayId)
    }
  }

  const selectedDayObj = trainingDays.find(d => d.id === selectedDayId)

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl flex items-center gap-2">
            <CalendarCheck className="w-8 h-8 text-fuchsia-500" />
            Frequência de Treinos
          </h1>
          <p className="text-neutral-400 mt-1">Acompanhe quem está comparecendo e veja o ranking do mês.</p>
        </div>
        <div className="w-full sm:w-64">
          <Select 
            value={currentMonthStr} 
            onValueChange={(val) => {
              if (!val) return
              setCurrentDate(parseMonthString(val))
            }}
          >
            <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white shadow-sm">
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

      <div className="grid gap-6 xl:grid-cols-3 items-start">
        {/* Lado Esquerdo: Lista de Frequência do Dia */}
        <Card className="bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white shadow-2xl xl:col-span-2">
          <CardHeader className="border-b border-neutral-900/50 pb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Bater o Ponto
              </CardTitle>
              {trainingDays.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm text-neutral-400 whitespace-nowrap">Dia de Treino:</span>
                  <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                    <SelectTrigger className="w-full sm:w-40 bg-neutral-900 border-neutral-800 h-9">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingDays.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          Dia {d.day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingDays ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : trainingDays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-500 text-center px-4">
                <CalendarCheck className="w-12 h-12 mb-4 opacity-20" />
                <p>Nenhum treino marcado para este mês no calendário.</p>
                <p className="text-sm mt-2">Adicione treinos no Dashboard para começar a registrar frequência.</p>
              </div>
            ) : loadingAtt ? (
              <div className="flex justify-center py-16">
                <Activity className="w-8 h-8 text-fuchsia-500 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800">
                    <TableHead className="text-neutral-400">Atleta</TableHead>
                    <TableHead className="text-neutral-400 text-right">Presente?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-6 text-neutral-500">Nenhum atleta ativo encontrado.</TableCell>
                    </TableRow>
                  ) : (
                    attendances.map((att) => (
                      <TableRow key={att.studentId} className="border-neutral-800/50 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium">{att.name}</TableCell>
                        <TableCell className="text-right">
                          <Switch 
                            checked={att.isPresent}
                            onCheckedChange={() => toggleAttendance(att.studentId, att.isPresent)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Lado Direito: Gráfico de Frequência Mensal */}
        <Card className="bg-neutral-950/60 backdrop-blur-xl border-white/10 text-white shadow-2xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              Atletas Mais Frequentes
            </CardTitle>
            <CardDescription className="text-neutral-400">Ranking baseado nos {trainingDays.length} treinos do mês.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-6">
            {ranking.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-center">
                <p>Nenhum dado de presença registrado neste mês.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ranking.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                    <XAxis type="number" hide domain={[0, trainingDays.length || 1]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a3a3a3', fontSize: 12 }} 
                      width={80}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value} presenças`, 'Total']}
                    />
                    <Bar dataKey="presenceCount" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {ranking.slice(0, 7).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#34d399' : '#a7f3d0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {ranking.length > 0 && (
              <div className="mt-6 space-y-3">
                {ranking.slice(0, 3).map((r, i) => (
                  <div key={r.studentId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        i === 1 ? 'bg-slate-400/20 text-slate-300' : 
                        'bg-amber-700/20 text-amber-600'
                      }`}>
                        {i + 1}
                      </span>
                      <span>{r.name}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{r.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
