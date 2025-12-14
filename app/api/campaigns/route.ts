import { NextRequest, NextResponse } from 'next/server';
import { getAllCampaigns, createCampaign } from '@/lib/db/campaigns';
import { Campaign } from '@/types';

// GET: Tüm kampanyaları getir
export async function GET() {
  try {
    const campaigns = await getAllCampaigns();
    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error('Kampanyaları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Yeni kampanya oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Zorunlu alanlar
    const { name, channel, message_template, target_type } = body;

    if (!name || !channel || !message_template || !target_type) {
      return NextResponse.json(
        { success: false, error: 'Zorunlu alanlar eksik' },
        { status: 400 }
      );
    }

    // Kampanya oluştur
    const campaignData: Partial<Campaign> = {
      name,
      channel,
      message_template,
      target_type,
      target_contacts: body.target_contacts || [],
      target_groups: body.target_groups || [],
      target_manual_phones: body.target_manual_phones || [],
      media_url: body.media_url,
      media_type: body.media_type,
      media_filename: body.media_filename,
      rate_limit_per_second: body.rate_limit_per_second || 1,
      rate_limit_per_minute: body.rate_limit_per_minute || 20,
      add_random_delay: body.add_random_delay !== false,
      delay_min_ms: body.delay_min_ms || 2000,
      delay_max_ms: body.delay_max_ms || 5000,
      require_consent: body.require_consent !== false,
      content_quality_check: body.content_quality_check !== false,
      status: 'draft',
      total_recipients: 0,
      sent_count: 0,
      failed_count: 0
    };

    const campaign = await createCampaign(campaignData);

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Kampanya oluşturuldu'
    });
  } catch (error: any) {
    console.error('Kampanya oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

