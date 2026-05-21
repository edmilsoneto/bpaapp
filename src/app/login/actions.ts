'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  
  // The official password defined by the user
  const adminPassword = process.env.ADMIN_PASSWORD || 'BPA3X3@100%#'

  if (password === adminPassword) {
    const cookieStore = await cookies()
    // Set a secure cookie that expires in 30 days
    cookieStore.set('bpa_auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    redirect('/')
  } else {
    return { error: 'Senha incorreta. Tente novamente.' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('bpa_auth_token')
  redirect('/login')
}
