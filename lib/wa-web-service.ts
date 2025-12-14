import QRCode from 'qrcode';

// whatsapp-web.js dynamic import
let Client: any;
let LocalAuth: any;

async function loadWhatsAppWeb() {
  if (!Client) {
    const waweb = await import('whatsapp-web.js');
    Client = waweb.Client;
    LocalAuth = waweb.LocalAuth;
  }
}

// Global state (Next.js module re-import sorununu çözmek için)
declare global {
  var waClient: any;
  var waIsReady: boolean;
  var waLastQR: string | null;
  var waConnectedPhone: string | null;
}

// Initialize globals
if (typeof global.waClient === 'undefined') global.waClient = null;
if (typeof global.waIsReady === 'undefined') global.waIsReady = false;
if (typeof global.waLastQR === 'undefined') global.waLastQR = null;
if (typeof global.waConnectedPhone === 'undefined') global.waConnectedPhone = null;

/**
 * WhatsApp Web Client'ı başlat
 */
export async function initializeClient(): Promise<{ success: boolean; error?: string }> {
  await loadWhatsAppWeb();

  // Zaten bağlı mı?
  if (global.waClient && global.waIsReady) {
    console.log('[WA] Zaten bağlı');
    return { success: true };
  }

  // Eski client varsa kapat
  if (global.waClient) {
    try {
      await global.waClient.destroy();
    } catch (e) {
      // ignore
    }
    global.waClient = null;
    global.waIsReady = false;
    global.waLastQR = null;
  }

  console.log('[WA] Client başlatılıyor...');

  // Apple Silicon için system Chrome kullan
  const isMacArm = process.platform === 'darwin' && process.arch === 'arm64';
  const chromePath = isMacArm
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined;

  if (isMacArm) {
    console.log('[WA] Apple Silicon - System Chrome kullanılıyor');
  }

  global.waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: false,
      executablePath: chromePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    }
  });

  // QR kodu
  global.waClient.on('qr', async (qr: string) => {
    console.log('[WA] QR kodu oluşturuldu');
    try {
      global.waLastQR = await QRCode.toDataURL(qr);
      console.log('[WA] QR base64 hazır, uzunluk:', global.waLastQR?.length);
    } catch (e) {
      console.error('[WA] QR base64 hatası:', e);
    }
  });

  // Bağlantı hazır
  global.waClient.on('ready', () => {
    console.log('[WA] Bağlantı hazır!');
    global.waIsReady = true;
    global.waLastQR = null;

    try {
      const info = global.waClient.info;
      global.waConnectedPhone = info?.wid?.user || null;
      console.log('[WA] Bağlı telefon:', global.waConnectedPhone);
    } catch (e) {
      console.error('[WA] Telefon bilgisi alınamadı:', e);
    }
  });

  // Authenticated
  global.waClient.on('authenticated', () => {
    console.log('[WA] Authenticated');
  });

  // Bağlantı koptu
  global.waClient.on('disconnected', (reason: string) => {
    console.log('[WA] Bağlantı koptu:', reason);
    global.waIsReady = false;
    global.waConnectedPhone = null;
    global.waLastQR = null;
    global.waClient = null;
  });

  // Initialize
  try {
    await global.waClient.initialize();
    console.log('[WA] Initialize tamamlandı');
    return { success: true };
  } catch (error: any) {
    console.error('[WA] Initialize hatası:', error.message);
    global.waClient = null;
    global.waIsReady = false;
    return { success: false, error: error.message };
  }
}

/**
 * Bağlantı durumunu getir
 */
export function getStatus(): { 
  connected: boolean; 
  phone: string | null; 
  hasQR: boolean;
  qrCode: string | null;
} {
  return {
    connected: global.waIsReady,
    phone: global.waConnectedPhone,
    hasQR: !!global.waLastQR,
    qrCode: global.waLastQR
  };
}

/**
 * Mesaj gönder (metin veya medya)
 */
export async function sendMessage(
  phone: string, 
  message: string,
  media?: {
    type: 'image' | 'video' | 'document' | 'audio';
    data: string; // base64 data veya URL
    filename?: string;
    caption?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log('[WA] sendMessage çağrıldı, isReady:', global.waIsReady, 'hasMedia:', !!media);
  
  if (!global.waClient || !global.waIsReady) {
    return { success: false, error: 'WhatsApp bağlı değil' };
  }

  try {
    // Client state kontrolü
    try {
      const state = await global.waClient.getState();
      console.log('[WA] Client state:', state);
      
      if (state !== 'CONNECTED') {
        global.waIsReady = false;
        return { success: false, error: 'WhatsApp bağlantısı aktif değil. Lütfen tekrar bağlanın.' };
      }
    } catch (stateError: any) {
      console.error('[WA] State kontrol hatası:', stateError.message);
      // State kontrolü başarısız olduysa bağlantı kopmuş demektir
      global.waIsReady = false;
      global.waClient = null;
      return { success: false, error: 'WhatsApp bağlantısı kopmuş. Lütfen sayfayı kapatıp tekrar bağlanın.' };
    }

    // Telefon numarasını formatla
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.endsWith('@c.us')) {
      formattedPhone = formattedPhone + '@c.us';
    }

    let result;

    if (media) {
      // Medya gönder
      const { MessageMedia } = await import('whatsapp-web.js');
      
      let mediaObj;
      
      if (media.data.startsWith('http://') || media.data.startsWith('https://')) {
        // URL'den medya oluştur
        console.log('[WA] URL\'den medya yükleniyor:', media.data);
        mediaObj = await MessageMedia.fromUrl(media.data, { unsafeMime: true });
      } else {
        // Base64'ten medya oluştur
        const mimeTypes: Record<string, string> = {
          image: 'image/jpeg',
          video: 'video/mp4',
          audio: 'audio/mpeg',
          document: 'application/pdf'
        };
        
        // Base64 prefix'i kaldır
        let base64Data = media.data;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        
        mediaObj = new MessageMedia(
          mimeTypes[media.type] || 'application/octet-stream',
          base64Data,
          media.filename || `file.${media.type === 'image' ? 'jpg' : media.type === 'video' ? 'mp4' : 'pdf'}`
        );
      }

      console.log('[WA] Medya gönderiliyor:', formattedPhone, media.type);
      
      // Medya ile birlikte mesaj gönder
      result = await global.waClient.sendMessage(formattedPhone, mediaObj, {
        caption: media.caption || message || undefined
      });
    } else {
      // Sadece metin gönder
      console.log('[WA] Metin gönderiliyor:', formattedPhone);
      result = await global.waClient.sendMessage(formattedPhone, message);
    }

    console.log('[WA] Mesaj gönderildi:', result.id._serialized);
    return { success: true, messageId: result.id._serialized };
  } catch (error: any) {
    console.error('[WA] Mesaj gönderme hatası:', error.message);
    console.error('[WA] Hata stack:', error.stack);
    
    // Protocol hatası veya session kapandı ise
    if (error.message.includes('Protocol error') || 
        error.message.includes('Session closed') ||
        error.message.includes('Target closed')) {
      console.log('[WA] Puppeteer bağlantısı koptu, state sıfırlanıyor...');
      global.waIsReady = false;
      global.waClient = null;
      global.waLastQR = null;
      global.waConnectedPhone = null;
      return { 
        success: false, 
        error: 'Tarayıcı bağlantısı koptu. Lütfen WhatsApp Web sayfasını kapatın ve "Bağlan" butonuna tekrar tıklayın.' 
      };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Toplu mesaj gönder
 */
export async function sendBulkMessages(
  phones: string[],
  message: string,
  media?: {
    type: 'image' | 'video' | 'document' | 'audio';
    data: string;
    filename?: string;
    caption?: string;
  },
  delayMs: number = 3000 // Mesajlar arası bekleme süresi (ban önleme)
): Promise<{ 
  success: boolean; 
  sent: number; 
  failed: number; 
  results: Array<{ phone: string; success: boolean; error?: string }> 
}> {
  if (!global.waClient || !global.waIsReady) {
    return { success: false, sent: 0, failed: phones.length, results: [] };
  }

  const results: Array<{ phone: string; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i];
    
    try {
      const result = await sendMessage(phone, message, media);
      
      if (result.success) {
        sent++;
        results.push({ phone, success: true });
      } else {
        failed++;
        results.push({ phone, success: false, error: result.error });
      }
    } catch (error: any) {
      failed++;
      results.push({ phone, success: false, error: error.message });
    }

    // Mesajlar arası bekleme (son mesaj hariç)
    if (i < phones.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(`[WA] Toplu gönderim tamamlandı: ${sent} başarılı, ${failed} başarısız`);
  return { success: true, sent, failed, results };
}

/**
 * Çoklu medya ile mesaj gönder
 * Not: WhatsApp bir mesajda sadece 1 medya kabul eder, bu yüzden sıralı mesajlar gönderilir
 */
export async function sendMessageWithMultipleMedia(
  phone: string,
  message: string,
  mediaItems: Array<{
    type: 'image' | 'video' | 'document' | 'audio';
    data: string; // URL veya base64
    filename?: string;
    caption?: string;
  }>,
  delayBetweenMessages: number = 2000
): Promise<{ success: boolean; messageIds?: string[]; error?: string }> {
  console.log('[WA] sendMessageWithMultipleMedia çağrıldı, medya sayısı:', mediaItems.length);
  
  if (!global.waClient || !global.waIsReady) {
    return { success: false, error: 'WhatsApp bağlı değil' };
  }

  if (mediaItems.length === 0) {
    return { success: false, error: 'En az bir medya gerekli' };
  }

  try {
    // Client state kontrolü
    try {
      const state = await global.waClient.getState();
      if (state !== 'CONNECTED') {
        global.waIsReady = false;
        return { success: false, error: 'WhatsApp bağlantısı aktif değil.' };
      }
    } catch (stateError: any) {
      global.waIsReady = false;
      global.waClient = null;
      return { success: false, error: 'WhatsApp bağlantısı kopmuş.' };
    }

    // Telefon numarasını formatla
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.endsWith('@c.us')) {
      formattedPhone = formattedPhone + '@c.us';
    }

    const messageIds: string[] = [];

    // İlk medyayı ana mesaj ile gönder
    const firstResult = await sendMessage(
      phone,
      message,
      mediaItems[0]
    );

    if (!firstResult.success) {
      return { success: false, error: firstResult.error };
    }

    if (firstResult.messageId) {
      messageIds.push(firstResult.messageId);
    }

    // Kalan medyaları sırayla gönder
    for (let i = 1; i < mediaItems.length; i++) {
      // Mesajlar arası bekleme (ban önleme)
      await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));

      const caption = mediaItems[i].caption || `${i + 1}/${mediaItems.length}`;
      const result = await sendMessage(phone, '', mediaItems[i]);

      if (result.success && result.messageId) {
        messageIds.push(result.messageId);
        console.log(`[WA] Medya ${i + 1}/${mediaItems.length} gönderildi`);
      } else {
        console.error(`[WA] Medya ${i + 1}/${mediaItems.length} gönderilemedi:`, result.error);
      }
    }

    console.log('[WA] Çoklu medya gönderimi tamamlandı:', messageIds.length, '/', mediaItems.length);
    return { success: true, messageIds };
  } catch (error: any) {
    console.error('[WA] Çoklu medya gönderme hatası:', error.message);
    
    if (error.message.includes('Protocol error') || 
        error.message.includes('Session closed') ||
        error.message.includes('Target closed')) {
      global.waIsReady = false;
      global.waClient = null;
      return { 
        success: false, 
        error: 'Tarayıcı bağlantısı koptu. Lütfen tekrar bağlanın.' 
      };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Client'ı kapat
 */
export async function destroyClient(): Promise<void> {
  if (global.waClient) {
    try {
      await global.waClient.destroy();
    } catch (e) {
      // ignore
    }
  }
  global.waClient = null;
  global.waIsReady = false;
  global.waLastQR = null;
  global.waConnectedPhone = null;
  console.log('[WA] Client kapatıldı');
}

/**
 * Kişileri getir
 */
export async function getContacts(): Promise<any[]> {
  if (!global.waClient || !global.waIsReady) {
    return [];
  }

  try {
    const contacts = await global.waClient.getContacts();
    return contacts
      .filter((c: any) => c.isMyContact && c.id.user)
      .map((c: any) => ({
        id: c.id._serialized,
        name: c.name || c.pushname || c.id.user,
        phone: c.id.user
      }));
  } catch (error) {
    console.error('[WA] Kişiler alınamadı:', error);
    return [];
  }
}

/**
 * Grupları getir
 */
export async function getGroups(): Promise<any[]> {
  if (!global.waClient || !global.waIsReady) {
    return [];
  }

  try {
    const chats = await global.waClient.getChats();
    return chats
      .filter((c: any) => c.isGroup)
      .map((c: any) => ({
        id: c.id._serialized,
        name: c.name,
        participantCount: c.participants?.length || 0
      }));
  } catch (error) {
    console.error('[WA] Gruplar alınamadı:', error);
    return [];
  }
}
