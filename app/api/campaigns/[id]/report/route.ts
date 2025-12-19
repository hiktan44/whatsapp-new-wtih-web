import { NextRequest, NextResponse } from 'next/server';
import { getCampaignReport } from '@/lib/db/campaigns';

// GET: Kampanya raporu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = params instanceof Promise ? await params : params;
    console.log('[API] Rapor isteniyor, campaignId:', id);
    const report = await getCampaignReport(id);
    console.log('[API] Rapor alındı:', report ? 'Başarılı' : 'Bulunamadı');

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    console.error('Kampanya raporu hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

