import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendTwilioWhatsAppMessage } from '@/lib/twilio'

const BodySchema = z.object({
  to: z.string().min(3),
  message: z.string().min(1),
  mediaUrls: z.array(z.string().url()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const body = BodySchema.parse(json)

    const result = await sendTwilioWhatsAppMessage({
      to: body.to,
      body: body.message,
      mediaUrls: body.mediaUrls,
    })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    const message =
      error?.name === 'ZodError'
        ? 'Geçersiz istek (invalid request)'
        : error?.message || 'Twilio gönderim hatası (Twilio send error)'
    console.error('[Twilio] send error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

