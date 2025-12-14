import { NextRequest, NextResponse } from 'next/server'
import { verifyUser } from '@/lib/db/users'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      )
    }

    const user = await verifyUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      )
    }

    // Create session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    })

    // Set session cookie
    response.cookies.set('session', JSON.stringify({ userId: user.id, username: user.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

