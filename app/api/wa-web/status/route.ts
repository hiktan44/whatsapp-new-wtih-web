import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getStatus } = await import('@/lib/wa-web-service');
    const status = getStatus();

    return NextResponse.json({
      success: true,
      connected: status.connected,
      phone: status.phone,
      hasQR: status.hasQR,
      qrCode: status.qrCode
    });
  } catch (error: any) {
    console.error('[API] Status hatası:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
