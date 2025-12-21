import { NextRequest } from 'next/server'
import { validateTwilioWebhook } from '@/lib/twilio'

function toRecord(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of formData.entries()) out[k] = String(v)
  return out
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const params = toRecord(formData)

  const signature = request.headers.get('x-twilio-signature')
  const ok = validateTwilioWebhook({
    // Twilio signature validation uses the full URL
    url: request.url,
    params,
    signature,
  })

  if (!ok) {
    return new Response('Invalid signature', { status: 403 })
  }

  // Burada gelen mesajı DB'ye kaydedebilir / bir queue'ya atabilirsiniz.
  // Şimdilik sadece logluyoruz.
  console.log('[Twilio] webhook message received:', {
    from: params.From,
    to: params.To,
    body: params.Body,
    messageSid: params.MessageSid,
    numMedia: params.NumMedia,
  })

  // Twilio webhook: 200 + TwiML (boş Response yeterli)
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

