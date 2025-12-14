import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '@/lib/db/settings'
import { sendMessage } from '@/lib/yoncu-api'
import { createMessageHistory } from '@/lib/db/message-history'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, message, contactName, mediaUrl, mediaType, mediaFilename } = body

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Telefon numarası ve mesaj gereklidir' },
        { status: 400 }
      )
    }

    // Get settings
    const settings = await getSettings()
    if (!settings || !settings.service_id || !settings.auth_token) {
      return NextResponse.json(
        { error: 'API ayarları yapılandırılmamış. Lütfen ayarlar sayfasından yapılandırın.' },
        { status: 400 }
      )
    }

    // Send message via Yoncu API (media ile)
    const [success, responseData] = await sendMessage(
      {
        serviceId: settings.service_id,
        authToken: settings.auth_token,
      },
      {
        Phone: phone,
        Message: message,
        MediaUrl: mediaUrl,
        MediaType: mediaType,
      }
    )

    if (success) {
      // Save to message history as successful (media bilgisi ile)
      await createMessageHistory({
        phone,
        message,
        contact_name: contactName || null,
        media_url: mediaUrl,
        media_type: mediaType,
        media_filename: mediaFilename,
        status: 'sent',
      })

      // responseData object veya string olabilir
      const resultMessage = typeof responseData === 'string' 
        ? responseData 
        : 'Mesaj başarıyla kuyruğa alındı'

      return NextResponse.json({
        success: true,
        message: resultMessage,
        data: typeof responseData === 'object' ? responseData : undefined,
      })
    } else {
      // Save to message history as failed
      await createMessageHistory({
        phone,
        message,
        contact_name: contactName || null,
        media_url: mediaUrl,
        media_type: mediaType,
        media_filename: mediaFilename,
        status: 'failed',
      })

      return NextResponse.json(
        { error: 'Mesaj gönderilemedi' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: error.message || 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

