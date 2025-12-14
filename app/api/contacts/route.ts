import { NextRequest, NextResponse } from 'next/server'
import { getContacts, createContact, searchContacts, bulkCreateContacts, bulkDeleteContacts } from '@/lib/db/contacts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    let contacts
    if (query) {
      contacts = await searchContacts(query)
    } else {
      contacts = await getContacts()
    }

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Kişiler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Bulk create
    if (Array.isArray(body)) {
      const contacts = await bulkCreateContacts(body)
      return NextResponse.json(contacts, { status: 201 })
    }

    // Single create
    const contact = await createContact(body)
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: 'Kişi oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return NextResponse.json(
        { error: 'Silinecek kişi ID\'leri belirtilmedi' },
        { status: 400 }
      )
    }

    // Bulk delete
    const idArray = ids.split(',')
    await bulkDeleteContacts(idArray)
    
    return NextResponse.json({ 
      success: true, 
      message: `${idArray.length} kişi başarıyla silindi` 
    })
  } catch (error) {
    console.error('Delete contacts error:', error)
    return NextResponse.json(
      { error: 'Kişiler silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

