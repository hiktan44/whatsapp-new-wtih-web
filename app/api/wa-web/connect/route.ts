import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { initializeClient } = await import('@/lib/wa-web-service');
    const result = await initializeClient();

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Bağlantı başlatıldı' });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API] Connect hatası:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
