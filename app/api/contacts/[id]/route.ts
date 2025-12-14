import { NextRequest, NextResponse } from 'next/server'
import { getContactById, updateContact, deleteContact } from '@/lib/db/contacts'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await getContactById(params.id)
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Kişi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Get contact error:', error)
    return NextResponse.json(
      { error: 'Kişi alınırken bir hata oluştu' },
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
    const contact = await updateContact(params.id, body)
    
    return NextResponse.json(contact)
  } catch (error) {
    console.error('Update contact error:', error)
    return NextResponse.json(
      { error: 'Kişi güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteContact(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete contact error:', error)
    return NextResponse.json(
      { error: 'Kişi silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

