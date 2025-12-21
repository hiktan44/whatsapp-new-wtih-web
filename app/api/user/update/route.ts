import { NextRequest, NextResponse } from 'next/server'
import { updateUserCredentials } from '@/lib/db/users'

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(session.value)
    const body = await request.json()
    const { username, password } = body

    if (!username && !password) {
      return NextResponse.json(
        { error: 'En az bir alan doldurulmalı' },
        { status: 400 }
      )
    }

    const updates: any = {}
    if (username) updates.username = username
    if (password) updates.password = password

    const user = await updateUserCredentials(sessionData.userId, updates)

    // Update session if username changed
    if (username) {
      const response = NextResponse.json({ success: true, user })
      response.cookies.set('session', JSON.stringify({ 
        userId: user.id, 
        username: user.username 
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

