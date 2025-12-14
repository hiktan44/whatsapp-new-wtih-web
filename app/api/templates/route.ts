import { NextRequest, NextResponse } from 'next/server'
import { getTemplates, createTemplate } from '@/lib/db/templates'

export async function GET(request: NextRequest) {
  try {
    const templates = await getTemplates()
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: 'Şablonlar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const template = await createTemplate(body)
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Şablon oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

