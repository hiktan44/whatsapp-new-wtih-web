import { NextRequest, NextResponse } from 'next/server';
import { getCampaignReport } from '@/lib/db/campaigns';

// GET: Kampanya raporu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await getCampaignReport(params.id);

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

