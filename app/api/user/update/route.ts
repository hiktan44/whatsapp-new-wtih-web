import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, updateUserCredentials } from '@/lib/db/users'

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')
    const body = await request.json()
    const { username, password } = body

    if (!username && !password) {
      return NextResponse.json(
        { error: 'En az bir alan doldurulmalı' },
        { status: 400 }
      )
    }

    // Login kaldırıldı:
    // - Session varsa o kullanıcıyı güncelle
    // - Session yoksa varsayılan olarak 'admin' kullanıcısını güncelle
    let targetUserId: string | null = null
    if (session) {
      const sessionData = JSON.parse(session.value)
      targetUserId = sessionData?.userId || null
    } else {
      const adminUser = await getUserByUsername('admin')
      targetUserId = adminUser?.id || null
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const updates: any = {}
    if (username) updates.username = username
    if (password) updates.password = password

    const user = await updateUserCredentials(targetUserId, updates)

    // Update session if username changed
    if (username && session) {
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

