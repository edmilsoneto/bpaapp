'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface Student {
  id: string
  name: string
  monthlyFee: number
  isActive: boolean
}

export default function AtletasPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('80')
  const [isActive, setIsActive] = useState(true)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/students')
      if (res.ok) {
        setStudents(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStudents()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    const fee = Number(monthlyFee)
    if (!name.trim() || Number.isNaN(fee) || fee < 0) {
      alert('Preencha o nome e a mensalidade corretamente.')
      return
    }

    const payload = {
      name: name.trim(),
      monthlyFee: fee,
      isActive
    }

    let url = '/api/students'
    let method = 'POST'

    if (isEditing && currentStudent) {
      url = `/api/students/${currentStudent.id}`
      method = 'PUT'
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setOpen(false)
        void fetchStudents()
      } else {
        alert('Erro ao salvar atleta')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar atleta')
    }
  }

  const openNewModal = () => {
    setIsEditing(false)
    setCurrentStudent(null)
    setName('')
    setMonthlyFee('80')
    setIsActive(true)
    setOpen(true)
  }

  const openEditModal = (student: Student) => {
    setIsEditing(true)
    setCurrentStudent(student)
    setName(student.name)
    setMonthlyFee(student.monthlyFee.toString())
    setIsActive(student.isActive)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Gestão de Atletas</h1>
        <Button onClick={openNewModal} className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700 sm:w-auto">Novo Atleta</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Atleta' : 'Novo Atleta'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Atleta</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Kayo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Mensalidade (R$)</Label>
                <Input id="fee" type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} />
              </div>
              {isEditing && (
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Mensalidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-neutral-500">Carregando...</TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-neutral-500">Nenhum atleta cadastrado.</TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>R$ {student.monthlyFee.toFixed(2)}</TableCell>
                    <TableCell>
                      {student.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 hover:bg-neutral-800">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(student)}>
                        Editar
                      </Button>
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
