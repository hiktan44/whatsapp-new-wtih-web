import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign } from '@/lib/db/campaigns';

// POST: Kampanyayı devam ettir
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await getCampaignById(params.id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Kampanya bulunamadı' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'paused') {
      return NextResponse.json(
        { success: false, error: 'Kampanya zaten çalışıyor veya tamamlanmış' },
        { status: 400 }
      );
    }

    await updateCampaign(params.id, { status: 'running' });

    return NextResponse.json({
      success: true,
      message: 'Kampanya devam ettiriliyor'
    });
  } catch (error: any) {
    console.error('Kampanya devam ettirme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

