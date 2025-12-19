import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * WhatsApp'tan grupları ve üyelerini çekip veritabanına kaydet
 */
export async function POST(request: Request) {
  try {
    console.log('[API] WhatsApp grupları senkronize ediliyor...');
    
    const { getGroupsWithParticipants } = await import('@/lib/wa-web-service');
    
    let waGroups: any[] = [];
    try {
      waGroups = await getGroupsWithParticipants();
      console.log(`[API] ${waGroups.length} grup WhatsApp'tan alındı`);
    } catch (error: any) {
      console.error('[API] WhatsApp grupları alınamadı:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'WhatsApp\'tan grup alınamadı. Bağlantınızı kontrol edin.'
      }, { status: 400 });
    }

    if (waGroups.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp\'tan grup bulunamadı. WhatsApp\'ta grup olduğundan emin olun.'
      }, { status: 400 });
    }

    const supabase = createClient();
    let addedGroups = 0;
    let updatedGroups = 0;
    let addedContacts = 0;
    let addedGroupMembers = 0;
    let errorCount = 0;

    for (const group of waGroups) {
      try {
        console.log(`[Sync] Grup işleniyor: ${group.name} (${group.participants.length} üye)`);

        // Grubu ekle veya güncelle
        const { data: existingGroup } = await supabase
          .from('groups')
          .select('id')
          .eq('name', group.name)
          .single();

        let groupId: string;

        if (existingGroup) {
          // Güncelle
          const { error } = await supabase
            .from('groups')
            .update({
              updated_at: new Date().toISOString()
            })
            .eq('id', existingGroup.id);

          if (!error) {
            updatedGroups++;
            groupId = existingGroup.id;
          } else {
            console.error('[Sync] Grup güncelleme hatası:', error);
            errorCount++;
            continue;
          }
        } else {
          // Yeni grup ekle
          const { data: newGroup, error } = await supabase
            .from('groups')
            .insert({
              name: group.name,
              description: `WhatsApp'tan senkronize edildi (${group.participantCount} üye)`
            })
            .select('id')
            .single();

          if (!error && newGroup) {
            addedGroups++;
            groupId = newGroup.id;
          } else {
            console.error('[Sync] Grup ekleme hatası:', error);
            errorCount++;
            continue;
          }
        }

        // Grup üyelerini işle
        for (const participant of group.participants) {
          try {
            // Telefon numarasını formatla
            let phone = participant.phone;
            if (!phone.startsWith('90')) {
              phone = '90' + phone;
            }

            // Kişinin var olup olmadığını kontrol et
            const { data: existingContact } = await supabase
              .from('contacts')
              .select('id')
              .eq('phone', phone)
              .single();

            let contactId: string;

            if (existingContact) {
              contactId = existingContact.id;
            } else {
              // Kişi yoksa ekle
              const nameParts = participant.name.split(' ');
              const firstName = nameParts[0] || participant.name;
              const lastName = nameParts.slice(1).join(' ') || '';

              const { data: newContact, error } = await supabase
                .from('contacts')
                .insert({
                  name: firstName,
                  surname: lastName,
                  phone: phone
                })
                .select('id')
                .single();

              if (!error && newContact) {
                contactId = newContact.id;
                addedContacts++;
                console.log(`[Sync] Yeni kişi eklendi: ${participant.name} (${phone})`);
              } else {
                console.error('[Sync] Kişi ekleme hatası:', error);
                continue;
              }
            }

            // Kişiyi gruba ekle (zaten varsa hata vermeyecek)
            const { data: existingMember } = await supabase
              .from('group_contacts')
              .select('group_id')
              .eq('group_id', groupId)
              .eq('contact_id', contactId)
              .single();

            if (!existingMember) {
              const { error } = await supabase
                .from('group_contacts')
                .insert({
                  group_id: groupId,
                  contact_id: contactId
                });

              if (!error) {
                addedGroupMembers++;
              } else {
                console.error('[Sync] Grup üyesi ekleme hatası:', error);
              }
            }
          } catch (error: any) {
            console.error('[Sync] Katılımcı işleme hatası:', error);
          }
        }

        console.log(`[Sync] Grup tamamlandı: ${group.name}`);
      } catch (error: any) {
        console.error('[Sync] Grup işleme hatası:', error);
        errorCount++;
      }
    }

    console.log(`[API] Grup senkronizasyonu tamamlandı:`);
    console.log(`  - ${addedGroups} yeni grup, ${updatedGroups} grup güncellendi`);
    console.log(`  - ${addedContacts} yeni kişi eklendi`);
    console.log(`  - ${addedGroupMembers} grup üyesi bağlandı`);
    console.log(`  - ${errorCount} hata`);

    return NextResponse.json({
      success: true,
      message: 'Gruplar ve üyeler başarıyla senkronize edildi',
      stats: {
        totalGroups: waGroups.length,
        addedGroups,
        updatedGroups,
        addedContacts,
        addedGroupMembers,
        errors: errorCount
      }
    });
  } catch (error: any) {
    console.error('[API] Sync groups hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

