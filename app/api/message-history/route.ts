import { NextRequest, NextResponse } from 'next/server'
import { getMessageHistory, searchMessageHistory, filterMessageHistoryByDate, createMessageHistory } from '@/lib/db/message-history'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')

    let history

    if (startDate && endDate) {
      history = await filterMessageHistoryByDate(startDate, endDate)
    } else if (query) {
      history = await searchMessageHistory(query)
    } else {
      history = await getMessageHistory(limit ? parseInt(limit) : undefined)
    }

    return NextResponse.json(history)
  } catch (error) {
    console.error('Get message history error:', error)
    return NextResponse.json(
      { error: 'Mesaj geçmişi alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, message, contact_name, status, channel, error } = body

    if (!phone || !message || !status) {
      return NextResponse.json(
        { error: 'Phone, message ve status zorunludur' },
        { status: 400 }
      )
    }

    const history = await createMessageHistory({
      phone,
      message,
      contact_name,
      status,
      channel: channel || 'yoncu',
      error
    })

    return NextResponse.json(history, { status: 201 })
  } catch (error) {
    console.error('Create message history error:', error)
    return NextResponse.json(
      { error: 'Mesaj geçmişi oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

