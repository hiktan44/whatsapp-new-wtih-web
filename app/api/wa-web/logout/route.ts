import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { logoutWaWeb } = await import('@/lib/wa-web-service');
    const { updateSessionStatus } = await import('@/lib/db/wa-web-sessions');

    await logoutWaWeb();

    // Database'i güncelle
    await updateSessionStatus('default', 'disconnected', null);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp Web oturumu kapatıldı'
    });
  } catch (error: any) {
    console.error('Logout hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
