import { NextRequest, NextResponse } from 'next/server'
import { getGroupContacts, addContactsToGroup, removeContactFromGroup } from '@/lib/db/groups'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contacts = await getGroupContacts(params.id)
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Get group contacts error:', error)
    return NextResponse.json(
      { error: 'Grup kişileri alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { contactIds } = body

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'Kişi ID listesi gerekli' },
        { status: 400 }
      )
    }

    await addContactsToGroup(params.id, contactIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Add contacts to group error:', error)
    return NextResponse.json(
      { error: 'Kişiler gruba eklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json(
        { error: 'Kişi ID gerekli' },
        { status: 400 }
      )
    }

    await removeContactFromGroup(params.id, contactId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove contact from group error:', error)
    return NextResponse.json(
      { error: 'Kişi gruptan çıkarılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
