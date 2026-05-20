'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Edit } from 'lucide-react'
import type { Goal } from '@/lib/types'

export function DashboardGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        setGoals(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchGoals()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    const targetAmount = Number(newTarget)
    if (!newTitle.trim() || Number.isNaN(targetAmount) || targetAmount <= 0) {
      alert('Preencha o nome da meta e o valor alvo corretamente.')
      return
    }

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          targetAmount,
          currentAmount: 0
        })
      })

      if (res.ok) {
        setNewTitle('')
        setNewTarget('')
        void fetchGoals()
      } else {
        alert('Erro ao criar a meta')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao criar a meta')
    }
  }

  const handleUpdateAmount = async (id: string) => {
    const currentAmount = Number(editValue)
    if (Number.isNaN(currentAmount) || currentAmount < 0) {
      alert('Informe um valor válido para atualizar a meta.')
      return
    }

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount })
      })

      if (res.ok) {
        setEditingGoalId(null)
        setEditValue('')
        void fetchGoals()
      } else {
        alert('Erro ao atualizar a meta')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar a meta')
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta meta?')) return

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        void fetchGoals()
      } else {
        alert('Erro ao excluir a meta')
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao excluir a meta')
    }
  }

  return (
    <div className="space-y-6 h-full">
      <Card className="h-full bg-neutral-950 border-neutral-900 text-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-white sm:text-xl">Metas do Time</CardTitle>
            <CardDescription className="text-neutral-400">Acompanhamento de caixas para novos uniformes, inscrições de torneios, etc.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Goal Form */}
          <form onSubmit={handleAddGoal} className="mb-6 grid items-end gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-neutral-300 font-medium">Nome da Meta</Label>
              <Input
                id="title"
                placeholder="Ex: Novos Uniformes"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-fuchsia-600"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target" className="text-neutral-300 font-medium">Valor Alvo (R$)</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                placeholder="Ex: 1500.00"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-fuchsia-600"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-fuchsia-600 font-medium text-white hover:bg-fuchsia-700 sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Meta
            </Button>
          </form>

          {/* Goals List */}
          {loading ? (
            <p className="text-center py-6 text-neutral-500">Carregando metas...</p>
          ) : goals.length === 0 ? (
            <p className="text-center py-6 text-neutral-500">Nenhuma meta ativa cadastrada.</p>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const percent = Math.min(Math.round(goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0), 100)
                const isEditing = editingGoalId === goal.id

                return (
                  <div key={goal.id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-white">{goal.title}</h4>
                        <p className="text-sm text-neutral-400">
                          Progresso: R$ {goal.currentAmount.toFixed(2)} de R$ {goal.targetAmount.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={editValue}
                              placeholder="Atual"
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-9 w-full bg-neutral-950 border-neutral-800 text-white focus-visible:ring-fuchsia-600 sm:w-24"
                            />
                            <Button size="sm" onClick={() => handleUpdateAmount(goal.id)} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white h-9">
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingGoalId(null)} className="h-9 border-neutral-800 hover:bg-neutral-800">
                              X
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingGoalId(goal.id)
                                setEditValue(goal.currentAmount.toString())
                              }}
                              className="h-9 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                            >
                              <Edit className="w-4 h-4 text-neutral-400" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="h-9 border-red-900/40 bg-red-950/20 hover:bg-red-950/50"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden border border-neutral-850">
                        <div
                          className="bg-fuchsia-600 h-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>{percent}% Completo</span>
                        <span>Falta: R$ {Math.max(goal.targetAmount - goal.currentAmount, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
