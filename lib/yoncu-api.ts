import { YoncuSendRequest, YoncuStatusResponse, YoncuQueueResponse } from '@/types'

const YONCU_API_BASE_URL = process.env.YONCU_API_BASE_URL || 'https://www.yoncu.com'

export interface YoncuApiConfig {
  serviceId: string
  authToken: string
}

export async function sendMessage(
  config: YoncuApiConfig,
  request: YoncuSendRequest
): Promise<[boolean, any]> {
  // Authorization token zaten "Basic " ile başlıyorsa ekleme
  const authHeader = config.authToken.startsWith('Basic ') 
    ? config.authToken 
    : `Basic ${config.authToken}`

  try {
    // Media varsa, request'e ekle
    const payload: any = {
      Phone: request.Phone,
      Message: request.Message,
    }

    // Media desteği - YoncuAPI'ye göre uyarla
    if (request.MediaUrl) {
      if (request.MediaType === 'image') {
        payload.MediaUrl = request.MediaUrl
      } else if (request.MediaType === 'video') {
        payload.VideoUrl = request.MediaUrl
      } else if (request.MediaType === 'document') {
        payload.DocumentUrl = request.MediaUrl
      } else if (request.MediaType === 'audio') {
        payload.AudioUrl = request.MediaUrl
      }
    }

    const response = await fetch(
      `${YONCU_API_BASE_URL}/API/WhatsApp/${config.serviceId}/Send`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'User-Agent': 'WhatsApp-Yoncu-Panel',
        },
        body: JSON.stringify(payload),
        redirect: 'manual',
        cache: 'no-store',
      }
    )

    // 303 ve diğer redirect'leri handle et
    if (response.status === 303 || response.status === 302 || response.status === 301) {
      throw new Error('Authentication hatası. Lütfen Service ID ve Authorization Token bilgilerinizi kontrol edin.')
    }

    if (!response.ok && response.status !== 200) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    if (error.message.includes('Authentication')) {
      throw error
    }
    throw new Error(`Bağlantı hatası: ${error.message}`)
  }
}

export async function getServiceStatus(
  config: YoncuApiConfig
): Promise<[boolean, YoncuStatusResponse]> {
  // Authorization token zaten "Basic " ile başlıyorsa ekleme
  const authHeader = config.authToken.startsWith('Basic ') 
    ? config.authToken 
    : `Basic ${config.authToken}`

  try {
    const response = await fetch(
      `${YONCU_API_BASE_URL}/API/WhatsApp/${config.serviceId}/Status`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': authHeader,
          'User-Agent': 'WhatsApp-Yoncu-Panel',
        },
        redirect: 'manual', // Manuel redirect handling
        cache: 'no-store',
      }
    )

    // 303 ve diğer redirect'leri handle et
    if (response.status === 303 || response.status === 302 || response.status === 301) {
      // Redirect durumunda authentication başarısız olabilir
      throw new Error('Authentication hatası. Lütfen Service ID ve Authorization Token bilgilerinizi kontrol edin.')
    }

    if (!response.ok && response.status !== 200) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    if (error.message.includes('Authentication')) {
      throw error
    }
    throw new Error(`Bağlantı hatası: ${error.message}. YoncuAPI servisinin aktif olduğundan emin olun.`)
  }
}

export async function getQueueStatus(
  config: YoncuApiConfig
): Promise<[boolean, YoncuQueueResponse | string]> {
  // Authorization token zaten "Basic " ile başlıyorsa ekleme
  const authHeader = config.authToken.startsWith('Basic ') 
    ? config.authToken 
    : `Basic ${config.authToken}`

  try {
    const response = await fetch(
      `${YONCU_API_BASE_URL}/API/WhatsApp/${config.serviceId}/Queue`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': authHeader,
          'User-Agent': 'WhatsApp-Yoncu-Panel',
        },
        redirect: 'manual',
        cache: 'no-store',
      }
    )

    // 303 ve diğer redirect'leri handle et
    if (response.status === 303 || response.status === 302 || response.status === 301) {
      throw new Error('Authentication hatası. Lütfen Service ID ve Authorization Token bilgilerinizi kontrol edin.')
    }

    if (!response.ok && response.status !== 200) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    if (error.message.includes('Authentication')) {
      throw error
    }
    throw new Error(`Bağlantı hatası: ${error.message}`)
  }
}

