import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, media } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Telefon numarası gerekli' },
        { status: 400 }
      );
    }

    if (!message && !media) {
      return NextResponse.json(
        { success: false, error: 'Mesaj veya medya gerekli' },
        { status: 400 }
      );
    }

    const { sendMessage } = await import('@/lib/wa-web-service');
    
    // Media URL string ise objeye çevir
    let mediaObj;
    if (media) {
      if (typeof media === 'string') {
        // URL veya base64 string
        const isUrl = media.startsWith('http://') || media.startsWith('https://');
        mediaObj = {
          type: 'image' as const, // Varsayılan olarak image
          data: media,
          caption: message
        };
      } else {
        mediaObj = media;
      }
    }
    
    const result = await sendMessage(
      phone, 
      message || '', 
      mediaObj
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: mediaObj ? 'Medya gönderildi' : 'Mesaj gönderildi',
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[API] Send hatası:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
