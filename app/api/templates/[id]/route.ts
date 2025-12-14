import { NextRequest, NextResponse } from 'next/server'
import { getTemplateById, updateTemplate, deleteTemplate } from '@/lib/db/templates'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await getTemplateById(params.id)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Şablon bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json(
      { error: 'Şablon alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const template = await updateTemplate(params.id, body)
    
    return NextResponse.json(template)
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json(
      { error: 'Şablon güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTemplate(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { error: 'Şablon silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

