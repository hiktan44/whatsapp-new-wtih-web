import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign, deleteCampaign } from '@/lib/db/campaigns';

// GET: Kampanyayı ID ile getir
export async function GET(
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

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Kampanya getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Kampanya güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const campaign = await updateCampaign(params.id, body);

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Kampanya güncellendi'
    });
  } catch (error: any) {
    console.error('Kampanya güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Kampanya sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCampaign(params.id);

    return NextResponse.json({
      success: true,
      message: 'Kampanya silindi'
    });
  } catch (error: any) {
    console.error('Kampanya silme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

