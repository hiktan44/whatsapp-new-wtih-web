import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    
    if (sessionName === 'default') {
      return NextResponse.json(
        { error: 'Default session silinemez' },
        { status: 400 }
      )
    }
    
    const { deleteSession } = await import('@/lib/db/wa-web-sessions')
    await deleteSession(sessionName)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Session silinemedi:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

