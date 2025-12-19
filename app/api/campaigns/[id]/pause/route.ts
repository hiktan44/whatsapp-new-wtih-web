import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign } from '@/lib/db/campaigns';

// POST: Kampanyayı duraklat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = params instanceof Promise ? await params : params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Kampanya bulunamadı' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'running' && campaign.status !== 'scheduled') {
      return NextResponse.json(
        { success: false, error: 'Kampanya zaten durdurulmuş veya tamamlanmış' },
        { status: 400 }
      );
    }

    await updateCampaign(id, { status: 'paused' });

    return NextResponse.json({
      success: true,
      message: 'Kampanya duraklatıldı'
    });
  } catch (error: any) {
    console.error('Kampanya duraklama hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

