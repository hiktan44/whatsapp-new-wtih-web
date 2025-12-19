import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('[API] Connect isteği alındı...');
    const { initializeClient } = await import('@/lib/wa-web-service');
    const result = await initializeClient();

    if (result.success) {
      console.log('[API] Client başlatıldı, QR kod bekleniyor...');
      return NextResponse.json({ 
        success: true, 
        message: 'Bağlantı başlatıldı. QR kodu birkaç saniye içinde görünecektir.' 
      });
    } else {
      console.error('[API] Client başlatılamadı:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Bağlantı kurulamadı' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API] Connect exception:', error);
    console.error('[API] Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Beklenmeyen bir hata oluştu' 
    }, { status: 500 });
  }
}
