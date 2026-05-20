import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const expectedPassword = process.env.BPA_PASSWORD
    if (!expectedPassword) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }

    if (password === expectedPassword) {
      const response = NextResponse.json({ success: true })
      
      // Set an HTTP-only cookie valid for 7 days
      response.cookies.set('bpa_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return response
    }

    return NextResponse.json({ error: 'Senha incorreta!' }, { status: 401 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
  }
}
