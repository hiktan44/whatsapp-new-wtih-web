import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById } from '@/lib/db/campaigns';
import { getContactById } from '@/lib/db/contacts';
import { getGroupById } from '@/lib/db/groups';
import { CampaignPreview } from '@/types';
import { checkCampaignCompliance } from '@/lib/compliance-service';

/**
 * Mesajdaki placeholder'ları doldurur
 */
function renderMessage(template: string, contact: any): string {
  return template
    .replace(/\{name\}/g, contact.name || '')
    .replace(/\{surname\}/g, contact.surname || '')
    .replace(/\{email\}/g, contact.email || '')
    .replace(/\{address\}/g, contact.address || '')
    .replace(/\{company\}/g, contact.company || '');
}

// POST: Kampanya önizleme
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

    // Hedef kitleyi belirle
    let recipients: any[] = [];

    if (campaign.target_type === 'contacts' && campaign.target_contacts) {
      // Kişiler
      for (const contactId of campaign.target_contacts) {
        const contact = await getContactById(contactId);
        if (contact) recipients.push(contact);
      }
    } else if (campaign.target_type === 'groups' && campaign.target_groups) {
      // Gruplar
      for (const groupId of campaign.target_groups) {
        const group = await getGroupById(groupId);
        if (group) {
          const groupContacts = await import('@/lib/db/groups').then(m => m.getGroupContacts(groupId));
          if (groupContacts && groupContacts.length > 0) recipients.push(...groupContacts);
        }
      }
    } else if (campaign.target_type === 'manual' && campaign.target_manual_phones) {
      // Manuel numara listesi
      recipients = campaign.target_manual_phones.map(phone => ({
        id: phone,
        phone,
        name: phone,
        surname: ''
      }));
    }

    // İlk 10 alıcı için preview oluştur
    const previewLimit = Math.min(10, recipients.length);
    const previews: CampaignPreview[] = [];

    for (let i = 0; i < previewLimit; i++) {
      const recipient = recipients[i];
      previews.push({
        recipient_phone: recipient.phone,
        recipient_name: recipient.name + (recipient.surname ? ' ' + recipient.surname : ''),
        rendered_message: renderMessage(campaign.message_template, recipient),
        media_url: campaign.media_url,
        media_type: campaign.media_type,
        media_filename: campaign.media_filename
      });
    }

    // Uyum kontrolü
    const compliance = await checkCampaignCompliance(
      campaign.message_template,
      recipients,
      campaign.media_filename,
      undefined, // Dosya boyutu bilgisi yok
      campaign.require_consent
    );

    // Özet bilgiler
    const summary = {
      total_recipients: recipients.length,
      previews_shown: previews.length,
      has_media: !!campaign.media_url,
      estimated_duration_minutes: Math.ceil((recipients.length * campaign.delay_max_ms) / 60000)
    };

    return NextResponse.json({
      success: true,
      previews,
      summary,
      compliance
    });
  } catch (error: any) {
    console.error('Kampanya preview hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

