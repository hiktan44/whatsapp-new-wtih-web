import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Login kaldırıldı: direkt dashboard'a yönlendir.
  redirect('/dashboard')
}

