import { NextRequest, NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/db/settings'

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Ayarlar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const settings = await updateSettings(body)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

