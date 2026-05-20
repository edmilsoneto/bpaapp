'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Senha incorreta!')
      }
    } catch (error) {
      console.error(error)
      setError('Erro ao se conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      {/* Background gradients for design depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-900/40 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-neutral-950 border-neutral-800 text-white shadow-2xl relative z-10">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="h-24 w-24 relative flex items-center justify-center bg-black rounded-2xl p-2 border border-neutral-800">
            <Image src="/logo.png" alt="BPA 3x3 Logo" width={96} height={96} className="object-contain" />
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">BPA 3x3</CardTitle>
            <CardDescription className="text-neutral-400">
              Painel de Controle Financeiro
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-fuchsia-600"
                required
              />
            </div>

            {error && (
              <div className="text-sm font-medium text-red-500 text-center bg-red-950/30 py-2 rounded-lg border border-red-900/30">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
