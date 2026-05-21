'use client'

import { useState } from 'react'
import { loginAction } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Dynamic background element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-fuchsia-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl shadow-fuchsia-900/20">
            <ShieldCheck className="w-10 h-10 text-fuchsia-500" />
          </div>
        </div>

        <Card className="bg-neutral-950/80 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
          {/* Top border highlight */}
          <div className="h-1 w-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-emerald-500"></div>
          
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              BPA 3x3 Gestão
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Área restrita da diretoria. Insira a senha mestre para acessar.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                  <Input 
                    type="password" 
                    name="password"
                    placeholder="Sua senha secreta" 
                    className="pl-10 bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-fuchsia-500/50 focus-visible:border-fuchsia-500 h-12"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 text-center font-medium">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold transition-all active:scale-[0.98] group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Acessar Painel
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-neutral-600 mt-8">
          &copy; {new Date().getFullYear()} BPA 3x3 Basketball. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
