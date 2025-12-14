import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '@/lib/db/settings'
import { getQueueStatus } from '@/lib/yoncu-api'

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings()
    if (!settings || !settings.service_id || !settings.auth_token) {
      return NextResponse.json(
        { error: 'API ayarları yapılandırılmamış' },
        { status: 400 }
      )
    }

    const [success, queueData] = await getQueueStatus({
      serviceId: settings.service_id,
      authToken: settings.auth_token,
    })

    if (success) {
      // queueData string veya object olabilir
      if (typeof queueData === 'string') {
        // String formatında mesaj gelirse parse et
        // Örnek: "Toplam 1 Mesaj Bulundu:\n+905354406577"
        // veya: "Mesaj Bulunamadı"
        
        if (queueData.toLowerCase().includes('bulunamadı') || queueData.toLowerCase().includes('bulunamadi')) {
          // Mesaj yok
          return NextResponse.json({
            success: true,
            count: 0,
            phones: [],
            message: queueData,
          })
        } else {
          // Mesaj var, string'den parse et
          // "Toplam X Mesaj Bulundu:" satırından sonraki telefon numaralarını al
          const lines = queueData.split('\n').filter(line => line.trim())
          const phones: string[] = []
          let count = 0
          
          lines.forEach(line => {
            // "Toplam X Mesaj Bulundu:" satırından count'u al
            if (line.toLowerCase().includes('toplam') && line.toLowerCase().includes('mesaj')) {
              const match = line.match(/(\d+)/)
              if (match) {
                count = parseInt(match[1])
              }
            }
            // Telefon numarası gibi görünen satırları al
            else if (line.trim().match(/^\+?\d+$/)) {
              phones.push(line.trim())
            }
          })
          
          return NextResponse.json({
            success: true,
            count: count || phones.length,
            phones: phones,
            message: queueData,
          })
        }
      } else {
        // Object formatında normal kuyruk datası
        return NextResponse.json({
          success: true,
          count: queueData.adet || 0,
          phones: queueData.Phones || [],
        })
      }
    } else {
      return NextResponse.json(
        { error: 'Kuyruk durumu alınamadı' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Get queue error:', error)
    return NextResponse.json(
      { error: error.message || 'Kuyruk durumu alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

