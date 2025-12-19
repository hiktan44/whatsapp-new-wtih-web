import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * WhatsApp'tan kişileri çekip veritabanına kaydet
 */
export async function POST(request: Request) {
  try {
    console.log('[API] WhatsApp kişileri senkronize ediliyor...');
    
    const { getContacts } = await import('@/lib/wa-web-service');
    
    let waContacts: any[] = [];
    try {
      waContacts = await getContacts();
      console.log(`[API] ${waContacts.length} kişi WhatsApp'tan alındı`);
    } catch (error: any) {
      console.error('[API] WhatsApp kişileri alınamadı:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'WhatsApp\'tan kişi alınamadı. Bağlantınızı kontrol edin.'
      }, { status: 400 });
    }

    if (waContacts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp\'tan kişi bulunamadı. WhatsApp\'ta kayıtlı kişileriniz olduğundan emin olun.'
      }, { status: 400 });
    }

    const supabase = createClient();
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const contact of waContacts) {
      try {
        // Telefon numarasını formatla (90 ile başlasın)
        let phone = contact.phone;
        if (!phone.startsWith('90')) {
          phone = '90' + phone;
        }

        // İsmi parse et (genelde "Ad Soyad" formatında)
        const nameParts = contact.name.split(' ');
        const firstName = nameParts[0] || contact.name;
        const lastName = nameParts.slice(1).join(' ') || '';

        // Önce kişinin var olup olmadığını kontrol et
        const { data: existing } = await supabase
          .from('contacts')
          .select('id')
          .eq('phone', phone)
          .single();

        if (existing) {
          // Güncelle
          const { error } = await supabase
            .from('contacts')
            .update({
              name: firstName,
              surname: lastName,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (!error) {
            updatedCount++;
          } else {
            errorCount++;
            console.error('[Sync] Güncelleme hatası:', phone, error);
          }
        } else {
          // Yeni ekle
          const { error } = await supabase
            .from('contacts')
            .insert({
              name: firstName,
              surname: lastName,
              phone: phone
            });

          if (!error) {
            addedCount++;
          } else {
            errorCount++;
            console.error('[Sync] Ekleme hatası:', phone, error);
          }
        }
      } catch (error: any) {
        console.error('[Sync] Kişi işleme hatası:', error);
        errorCount++;
      }
    }

    console.log(`[API] Senkronizasyon tamamlandı: ${addedCount} yeni, ${updatedCount} güncellendi, ${errorCount} hata`);

    return NextResponse.json({
      success: true,
      message: 'Kişiler başarıyla senkronize edildi',
      stats: {
        total: waContacts.length,
        added: addedCount,
        updated: updatedCount,
        errors: errorCount
      }
    });
  } catch (error: any) {
    console.error('[API] Sync contacts hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

