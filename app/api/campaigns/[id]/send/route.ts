import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign, createSendJobsBulk } from '@/lib/db/campaigns';
import { getContactById } from '@/lib/db/contacts';
import { getGroupById, getGroupContacts } from '@/lib/db/groups';
import { SendJob } from '@/types';

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

// POST: Kampanyayı gönderime başlat (enqueue)
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

    if (campaign.status === 'running') {
      return NextResponse.json(
        { success: false, error: 'Kampanya zaten çalışıyor' },
        { status: 400 }
      );
    }

    // Hedef kitleyi belirle
    let recipients: any[] = [];

    if (campaign.target_type === 'contacts' && campaign.target_contacts) {
      for (const contactId of campaign.target_contacts) {
        const contact = await getContactById(contactId);
        if (contact) recipients.push(contact);
      }
    } else if (campaign.target_type === 'groups' && campaign.target_groups) {
      for (const groupId of campaign.target_groups) {
        const groupContacts = await getGroupContacts(groupId);
        if (groupContacts && groupContacts.length > 0) recipients.push(...groupContacts);
      }
    } else if (campaign.target_type === 'manual' && campaign.target_manual_phones) {
      recipients = campaign.target_manual_phones.map(phone => ({
        id: phone,
        phone,
        name: phone,
        surname: ''
      }));
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alıcı bulunamadı' },
        { status: 400 }
      );
    }

    // Send job'ları oluştur
    const now = new Date();
    const jobs: Partial<SendJob>[] = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      // Her mesaj için kademeli zamanla (rate limiting)
      const delayMs = i * (campaign.delay_min_ms + Math.random() * (campaign.delay_max_ms - campaign.delay_min_ms));
      const scheduledAt = new Date(now.getTime() + delayMs);

      jobs.push({
        campaign_id: campaign.id,
        recipient_phone: recipient.phone,
        recipient_name: recipient.name + (recipient.surname ? ' ' + recipient.surname : ''),
        recipient_contact_id: recipient.id !== recipient.phone ? recipient.id : undefined,
        message_content: renderMessage(campaign.message_template, recipient),
        media_url: campaign.media_url,
        media_type: campaign.media_type,
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        scheduled_at: scheduledAt.toISOString()
      });
    }

    // Job'ları database'e ekle
    await createSendJobsBulk(jobs);

    // Kampanya durumunu güncelle
    await updateCampaign(campaign.id, {
      status: 'scheduled',
      total_recipients: recipients.length,
      started_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Kampanya başlatıldı. ${recipients.length} mesaj kuyruğa eklendi.`,
      total_jobs: jobs.length
    });
  } catch (error: any) {
    console.error('Kampanya gönderimi başlatma hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

