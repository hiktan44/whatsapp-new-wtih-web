import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '@/lib/db/settings'
import { getServiceStatus } from '@/lib/yoncu-api'

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings()
    if (!settings || !settings.service_id || !settings.auth_token) {
      return NextResponse.json(
        { error: 'API ayarları yapılandırılmamış' },
        { status: 400 }
      )
    }

    const [success, statusData] = await getServiceStatus({
      serviceId: settings.service_id,
      authToken: settings.auth_token,
    })

    if (success) {
      // status "1" string olarak geliyor
      const isActive = statusData.status === "1" || statusData.status === 1;
      return NextResponse.json({
        success: true,
        status: statusData.status,
        isActive,
        message: isActive ? 'Servis aktif' : 'Servis pasif',
      })
    } else {
      return NextResponse.json(
        { error: 'Servis durumu alınamadı' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Get status error:', error)
    return NextResponse.json(
      { error: error.message || 'Servis durumu alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

