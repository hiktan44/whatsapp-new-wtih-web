/* eslint-env node */
import 'server-only'
import process from 'node:process'
import twilio from 'twilio'

export type TwilioWhatsAppSendInput = {
  to: string // E.164 format, örn: +905XXXXXXXXX
  body: string
  mediaUrls?: string[]
}

function getRequiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} eksik (missing)`)
  return v
}

export function getTwilioClient() {
  const accountSid = getRequiredEnv('TWILIO_ACCOUNT_SID')
  const authToken = getRequiredEnv('TWILIO_AUTH_TOKEN')
  return twilio(accountSid, authToken)
}

export function getTwilioWhatsAppFrom(): string {
  // Twilio sandbox: whatsapp:+14155238886
  // Prod: whatsapp:+<Twilio WhatsApp enabled number>
  return getRequiredEnv('TWILIO_WHATSAPP_FROM')
}

/**
 * TR: Twilio WhatsApp üzerinden mesaj gönderir.
 * EN: Sends a WhatsApp message via Twilio.
 */
export async function sendTwilioWhatsAppMessage(input: TwilioWhatsAppSendInput) {
  const client = getTwilioClient()
  const from = getTwilioWhatsAppFrom()

  const to = input.to.startsWith('whatsapp:') ? input.to : `whatsapp:${input.to}`

  const msg = await client.messages.create({
    from,
    to,
    body: input.body,
    mediaUrl: input.mediaUrls && input.mediaUrls.length > 0 ? input.mediaUrls : undefined,
  })

  return {
    sid: msg.sid,
    status: msg.status,
    to: msg.to,
    from: msg.from,
  }
}

/**
 * TR: Webhook doğrulaması (opsiyonel). Eğer aktif etmek istersen:
 * - TWILIO_VALIDATE_WEBHOOK=true
 * EN: Optional webhook signature validation.
 */
export function validateTwilioWebhook({
  url,
  params,
  signature,
}: {
  url: string
  params: Record<string, string>
  signature: string | null
}) {
  if (process.env.TWILIO_VALIDATE_WEBHOOK !== 'true') return true

  const authToken = getRequiredEnv('TWILIO_AUTH_TOKEN')
  if (!signature) return false

  return twilio.validateRequest(authToken, signature, url, params)
}

