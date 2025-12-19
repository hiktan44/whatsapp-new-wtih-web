import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Çoklu medya ile mesaj gönderme endpoint'i
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, mediaItems, linkUrl, linkText } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Telefon numarası gerekli' },
        { status: 400 }
      );
    }

    if (!message && (!mediaItems || mediaItems.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Mesaj veya medya gerekli' },
        { status: 400 }
      );
    }

    // Link varsa mesajın sonuna ekle
    let finalMessage = message || '';
    if (linkUrl) {
      const linkMessage = linkText 
        ? `\n\n👉 ${linkText}\n${linkUrl}` 
        : `\n\n🔗 ${linkUrl}`;
      finalMessage += linkMessage;
    }

    const { sendMessage, sendMessageWithMultipleMedia, getStatus } = await import('@/lib/wa-web-service');
    
    // Önce bağlantı durumunu kontrol et
    const status = await getStatus();
    if (!status.connected) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp bağlı değil. Lütfen önce bağlantı kurun.' },
        { status: 400 }
      );
    }
    
    // Çoklu medya var mı?
    if (mediaItems && mediaItems.length > 0) {
      console.log('[API] Çoklu medya gönderiliyor:', mediaItems.length, 'medya');
      const result = await sendMessageWithMultipleMedia(
        phone,
        finalMessage,
        mediaItems
      );

      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: `${mediaItems.length} medya gönderildi`,
          messageIds: result.messageIds 
        });
      } else {
        console.error('[API] Çoklu medya gönderme hatası:', result.error);
        return NextResponse.json(
          { success: false, error: result.error || 'Mesaj gönderilemedi' },
          { status: 500 }
        );
      }
    } else {
      // Sadece metin mesajı
      console.log('[API] Metin mesajı gönderiliyor');
      const result = await sendMessage(phone, finalMessage);

      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Mesaj gönderildi',
          messageId: result.messageId 
        });
      } else {
        console.error('[API] Mesaj gönderme hatası:', result.error);
        return NextResponse.json(
          { success: false, error: result.error || 'Mesaj gönderilemedi' },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('[API] Multi-media send hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

