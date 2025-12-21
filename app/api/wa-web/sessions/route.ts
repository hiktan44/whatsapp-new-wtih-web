import { NextResponse } from 'next/server'

// Session'ları listele
export async function GET() {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    const { data: sessions, error } = await supabase
      .from('wa_web_sessions')
      .select('*')
      .order('session_name')
    
    if (error) throw error
    
    return NextResponse.json(sessions || [])
  } catch (error: any) {
    console.error('[API] Session listesi alınamadı:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Yeni session oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { session_name } = body
    
    if (!session_name) {
      return NextResponse.json(
        { error: 'session_name gerekli' },
        { status: 400 }
      )
    }
    
    // Session name validation (max 5 session)
    const { supabase } = await import('@/lib/supabase')
    const { data: existingSessions } = await supabase
      .from('wa_web_sessions')
      .select('id')
    
    if (existingSessions && existingSessions.length >= 5) {
      return NextResponse.json(
        { error: 'Maksimum 5 session oluşturulabilir' },
        { status: 400 }
      )
    }
    
    const { updateSessionStatus } = await import('@/lib/db/wa-web-sessions')
    await updateSessionStatus(session_name, 'disconnected')
    
    return NextResponse.json({ success: true, session_name })
  } catch (error: any) {
    console.error('[API] Session oluşturulamadı:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}




