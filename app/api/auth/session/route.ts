import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = request.cookies.get('session')

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const sessionData = JSON.parse(session.value)
    return NextResponse.json({
      authenticated: true,
      user: sessionData,
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

