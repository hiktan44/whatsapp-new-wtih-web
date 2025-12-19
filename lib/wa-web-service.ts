import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

// Global type definitions for WhatsApp Web
declare global {
  var waClient: any;
  var waIsReady: boolean;
  var waQrCode: string | null;
  var waInitializing: boolean;
}

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

/**
 * Container içindeki Chromium process'lerini temizle
 */
async function killChromiumProcesses(): Promise<void> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Tüm chromium/chrome process'lerini bul ve kill et
    try {
      await execAsync('pkill -9 chromium || true');
      await execAsync('pkill -9 chrome || true');
      await execAsync('pkill -9 chromium-browser || true');
      console.log('[WA] Chromium process\'leri temizlendi');
    } catch (e) {
      // Process bulunamadıysa sorun değil
      console.log('[WA] Temizlenecek Chromium process\'i bulunamadı');
    }
    
    // Biraz bekle (process'lerin tamamen kapanması için)
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error: any) {
    console.warn('[WA] Chromium process temizleme hatası:', error.message);
    // Hata kritik değil, devam et
  }
}

/**
 * SingletonLock dosyasını temizle (önceki oturum düzgün kapanmamışsa)
 * Docker container'da daha agresif temizlik yapar
 */
async function cleanupSingletonLock(): Promise<void> {
  try {
    const authDir = path.join(process.cwd(), '.wwebjs_auth');
    const sessionDir = path.join(authDir, 'session');
    
    // Session dizini yoksa oluştur
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
      return;
    }
    
    // Tüm lock ve socket dosyalarını temizle
    const filesToClean = [
      'SingletonLock',
      'SingletonSocket',
      'lockfile',
      'LOCK'
    ];
    
    for (const fileName of filesToClean) {
      const filePath = path.join(sessionDir, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`[WA] ${fileName} dosyası bulundu, temizleniyor...`);
        try {
          // Dosya izinlerini değiştir (okuma/yazma izni ver)
          try {
            fs.chmodSync(filePath, 0o666);
          } catch (chmodError) {
            // chmod hatası önemli değil
          }
          
          // Dosyayı sil
          fs.unlinkSync(filePath);
          console.log(`[WA] ${fileName} temizlendi`);
        } catch (e: any) {
          // Dosya kilitli olabilir, birkaç kez dene
          console.log(`[WA] ${fileName} kilitli, tekrar deneniyor...`);
          
          // 3 kez dene, her seferinde 200ms bekle
          let deleted = false;
          for (let i = 0; i < 3; i++) {
            try {
              // Async bekleme
              await new Promise(resolve => setTimeout(resolve, 200));
              
              if (fs.existsSync(filePath)) {
                try {
                  fs.chmodSync(filePath, 0o666);
                } catch (chmodError) {
                  // chmod hatası önemli değil
                }
                fs.unlinkSync(filePath);
                console.log(`[WA] ${fileName} temizlendi (deneme ${i + 1})`);
                deleted = true;
                break;
              }
            } catch (e2: any) {
              if (i === 2) {
                console.warn(`[WA] ${fileName} temizlenemedi:`, e2.message);
                // Son denemede başarısız olduysa, dosyayı rename et (geçici çözüm)
                try {
                  const backupPath = `${filePath}.old.${Date.now()}`;
                  fs.renameSync(filePath, backupPath);
                  console.log(`[WA] ${fileName} yedek olarak taşındı: ${backupPath}`);
                } catch (renameError) {
                  console.warn(`[WA] ${fileName} taşınamadı, devam ediliyor...`);
                }
              }
            }
          }
        }
      }
    }
    
    // Docker'da tüm Chromium process'lerini de kontrol et (opsiyonel)
    const isDocker = process.env.DOCKER === 'true' || process.env.NODE_ENV === 'production';
    if (isDocker) {
      console.log('[WA] Docker ortamı tespit edildi, ek temizlik yapılıyor...');
      // Tüm .lock uzantılı dosyaları temizle
      try {
        const files = fs.readdirSync(sessionDir);
        for (const file of files) {
          if (file.includes('lock') || file.includes('Lock') || file.includes('LOCK')) {
            const filePath = path.join(sessionDir, file);
            try {
              if (fs.existsSync(filePath)) {
                try {
                  fs.chmodSync(filePath, 0o666);
                } catch (chmodError) {
                  // chmod hatası önemli değil
                }
                fs.unlinkSync(filePath);
                console.log(`[WA] Ek lock dosyası temizlendi: ${file}`);
              }
            } catch (e) {
              console.warn(`[WA] ${file} temizlenemedi:`, e);
            }
          }
        }
      } catch (readError) {
        // Dizin okuma hatası önemli değil
      }
    }
  } catch (error: any) {
    console.error('[WA] SingletonLock temizleme hatası:', error.message);
    // Hata kritik değil, devam et
  }
}

/**
 * IndexedDB cache'ini temizle (IndexedDB hatalarını önlemek için)
 * LocalAuth'un kullandığı userDataDir'i bulup temizler
 */
function cleanupIndexedDBCache(): void {
  try {
    // LocalAuth genellikle .wwebjs_auth altında Chrome user data directory oluşturur
    // Ancak tam yolu bilmediğimiz için, tüm .wwebjs_auth altındaki IndexedDB dizinlerini arıyoruz
    
    const authDir = path.join(process.cwd(), '.wwebjs_auth');
    
    if (!fs.existsSync(authDir)) {
      return;
    }
    
    // Recursive olarak IndexedDB dizinlerini bul
    const findIndexedDBDirs = (dir: string): string[] => {
      const dirs: string[] = [];
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === 'IndexedDB') {
              dirs.push(fullPath);
            } else {
              // Alt dizinleri de kontrol et
              dirs.push(...findIndexedDBDirs(fullPath));
            }
          }
        }
      } catch (e) {
        // Erişim hatası olabilir, önemli değil
      }
      return dirs;
    };
    
    const indexedDBDirs = findIndexedDBDirs(authDir);
    
    if (indexedDBDirs.length > 0) {
      console.log('[WA] IndexedDB cache temizleniyor...');
      for (const indexedDBDir of indexedDBDirs) {
        try {
          const files = fs.readdirSync(indexedDBDir);
          for (const file of files) {
            const filePath = path.join(indexedDBDir, file);
            try {
              const stat = fs.statSync(filePath);
              if (stat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
              } else {
                fs.unlinkSync(filePath);
              }
            } catch (e) {
              // Dosya kilitli olabilir, önemli değil
            }
          }
        } catch (e) {
          // Dizin erişilemez olabilir, önemli değil
        }
      }
      console.log('[WA] IndexedDB cache temizlendi');
    }
  } catch (error: any) {
    console.error('[WA] IndexedDB cache temizleme hatası:', error.message);
    // Hata kritik değil, devam et
  }
}

// Session state interface
interface SessionState {
  client: any;
  isReady: boolean;
  lastQR: string | null;
  connectedPhone: string | null;
  sessionName: string;
}

// Global state (Next.js module re-import sorununu çözmek için)
declare global {
  var waSessions: Map<string, SessionState>;
}

// Initialize globals - Çoklu session desteği
if (typeof global.waSessions === 'undefined') {
  global.waSessions = new Map<string, SessionState>();
}

// Backward compatibility için default session helper'ları
const getDefaultSession = () => global.waSessions.get('default');
const ensureDefaultSession = () => {
  if (!global.waSessions.has('default')) {
    global.waSessions.set('default', {
      client: null,
      isReady: false,
      lastQR: null,
      connectedPhone: null,
      sessionName: 'default'
    });
  }
  return global.waSessions.get('default')!;
};

/**
 * Çoklu session için session bilgisi al
 */
function getSession(sessionName: string = 'default'): SessionState {
  if (!global.waSessions.has(sessionName)) {
    global.waSessions.set(sessionName, {
      client: null,
      isReady: false,
      lastQR: null,
      connectedPhone: null,
      sessionName
    });
  }
  return global.waSessions.get(sessionName)!;
}

/**
 * Tüm aktif session'ları listele
 */
export async function listSessions(): Promise<SessionState[]> {
  return Array.from(global.waSessions.values());
}

/**
 * WhatsApp Web Client'ı başlat (çoklu session desteği ile)
 */
export async function initializeClient(sessionName: string = 'default'): Promise<{ success: boolean; error?: string }> {
  await loadWhatsAppWeb();

  // Zaten bağlı mı?
  if (global.waClient && global.waIsReady) {
    console.log('[WA] Zaten bağlı');
    return { success: true };
  }

  // Eski client varsa kapat (daha agresif temizlik)
  if (global.waClient) {
    console.log('[WA] Eski client kapatılıyor...');
    try {
      // Önce state kontrolü yap
      try {
        const state = await global.waClient.getState();
        console.log('[WA] Eski client state:', state);
      } catch (e) {
        console.log('[WA] Eski client state kontrolü başarısız (normal olabilir)');
      }
      
      // Client'ı kapat
      await global.waClient.destroy();
      console.log('[WA] Eski client kapatıldı');
    } catch (e: any) {
      console.warn('[WA] Eski client kapatılırken hata:', e.message);
      // ignore - devam et
    }
    
    // Global state'i temizle
    global.waClient = null;
    global.waIsReady = false;
    global.waLastQR = null;
    global.waConnectedPhone = null;
    
    // Kısa bekleme (process'in tamamen kapanması için) - 500ms'ye düşürüldü
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Docker container kontrolü
  const isDocker = process.env.DOCKER === 'true';
  
  // Docker'da Chromium process'lerini temizle
  if (isDocker) {
    await killChromiumProcesses();
  }
  
  // SingletonLock dosyasını temizle (önceki oturum düzgün kapanmamışsa)
  await cleanupSingletonLock();
  
  // IndexedDB cache'ini temizle (IndexedDB hatalarını önlemek için)
  cleanupIndexedDBCache();

  console.log('[WA] Client başlatılıyor...');
  const isMacArm = process.platform === 'darwin' && process.arch === 'arm64';
  
  // Headless mode: Sadece Docker'da veya açıkça WA_WEB_HEADLESS=1 ise
  // Local development'ta headless kapalı (yeni sekmede açılacak)
  const headlessMode = isDocker || (process.env.WA_WEB_HEADLESS === '1' || process.env.WA_WEB_HEADLESS === 'true');
  
  // Chrome path: Sadece macOS'ta ve headless değilse
  const chromePath = !headlessMode && isMacArm
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined;

  if (headlessMode) {
    console.log('[WA] Headless mode aktif (Docker/Production)');
  } else if (isMacArm) {
    console.log('[WA] Apple Silicon - System Chrome kullanılıyor');
  }

  // LocalAuth kendi userDataDir'ini yönetir, biz manuel olarak veremeyiz
  // IndexedDB sorunlarını çözmek için Chrome argümanlarını kullanıyoruz
  
  // Docker için temel argümanlar - Hız optimizasyonları eklendi
  const baseArgs = [
    '--no-sandbox', 
    '--disable-setuid-sandbox', 
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-software-rasterizer',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--enable-features=NetworkService,NetworkServiceInProcess',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--allow-running-insecure-content',
    '--disable-blink-features=AutomationControlled',
    '--disable-site-isolation-trials', // IndexedDB sorunlarını önler
    '--disable-features=IsolateOrigins,site-per-process', // IndexedDB için
    // Hız optimizasyonları
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--disable-translate',
    '--no-first-run',
    '--disable-component-update',
    '--disable-client-side-phishing-detection',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-domain-reliability',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-features=MediaRouter',
    '--disable-breakpad',
    '--disable-component-extensions-with-background-pages',
    '--fast-start', // Hızlı başlatma
    '--disable-infobars' // Bilgi çubuklarını kapat
  ];

  // Docker/Headless için ek argümanlar
  if (headlessMode) {
    baseArgs.push(
      '--headless=new', // Yeni headless mode
      '--disable-software-rasterizer',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    );
  } else {
    // Non-headless mode: Yeni sekmede açılması için
    baseArgs.push(
      '--new-window', // Yeni pencerede aç
      '--start-maximized' // Maksimize aç
    );
    
    // macOS için ek argümanlar
    if (isMacArm) {
      baseArgs.push('--use-mock-keychain');
    }
  }
  
  global.waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: headlessMode,
      executablePath: chromePath,
      // userDataDir kullanmıyoruz - LocalAuth kendi yönetiyor
      args: baseArgs,
      // Timeout ayarları - Navigation için daha uzun süreler
      timeout: 60000, // 60 saniye (navigation için)
      protocolTimeout: 120000 // 2 dakika protocol timeout
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
    },
    // QR kod oluşturma timeout'u
    qrMaxRetries: 5, // QR kod için maksimum deneme sayısı (artırıldı)
    takeoverOnConflict: true, // Çakışma durumunda otomatik devralma
    takeoverTimeoutMs: 0, // Timeout yok (anında devralma)
    // Restart stratejisi
    restartOnAuthFail: true, // Auth başarısız olursa yeniden başlat
    // Client ayarları
    authTimeoutMs: 60000 // Auth timeout 60 saniye
  });

  // Event handler'ları kuran yardımcı fonksiyon
  const setupEventHandlers = () => {
    // QR kodu
    global.waClient.on('qr', async (qr: string) => {
      console.log('[WA] QR kodu oluşturuldu');
      try {
        global.waLastQR = await QRCode.toDataURL(qr);
        console.log('[WA] QR base64 hazır, uzunluk:', global.waLastQR?.length);
        
        try {
          const { updateSessionStatus } = await import('./db/wa-web-sessions');
          await updateSessionStatus('default', 'qr_pending', global.waLastQR);
          console.log('[WA] QR database\'e kaydedildi');
        } catch (dbError) {
          console.error('[WA] QR database kayıt hatası:', dbError);
        }
      } catch (e) {
        console.error('[WA] QR base64 hatası:', e);
      }
    });

    // Bağlantı hazır
    global.waClient.on('ready', async () => {
      console.log('[WA] Bağlantı hazır!');
      global.waIsReady = true;
      global.waLastQR = null;

      try {
        const info = global.waClient.info;
        global.waConnectedPhone = info?.wid?.user || null;
        console.log('[WA] Bağlı telefon:', global.waConnectedPhone);
        
        try {
          const { updateSessionStatus } = await import('./db/wa-web-sessions');
          await updateSessionStatus('default', 'connected', undefined, global.waConnectedPhone || undefined);
          console.log('[WA] Bağlantı durumu database\'e kaydedildi');
        } catch (dbError) {
          console.error('[WA] Database kayıt hatası:', dbError);
        }
      } catch (e) {
        console.error('[WA] Telefon bilgisi alınamadı:', e);
      }
    });

    // Authenticated
    global.waClient.on('authenticated', async () => {
      console.log('[WA] Authenticated - QR kod tarandı, bağlantı kuruluyor...');
      try {
        const { updateSessionStatus } = await import('./db/wa-web-sessions');
        await updateSessionStatus('default', 'authenticated');
        console.log('[WA] Authenticated durumu database\'e kaydedildi');
      } catch (dbError) {
        console.error('[WA] Database kayıt hatası:', dbError);
      }
    });

    // Bağlantı koptu
    global.waClient.on('disconnected', async (reason: string) => {
      console.log('[WA] Bağlantı koptu:', reason);
      global.waIsReady = false;
      global.waConnectedPhone = null;
      global.waLastQR = null;
      
      const oldClient = global.waClient;
      global.waClient = null;
      
      if (oldClient) {
        try {
          await oldClient.destroy();
        } catch (e) {
          // ignore
        }
      }
      
      try {
        const { updateSessionStatus } = await import('./db/wa-web-sessions');
        await updateSessionStatus('default', 'disconnected');
        console.log('[WA] Bağlantı kopma durumu database\'e kaydedildi');
      } catch (dbError) {
        console.error('[WA] Database kayıt hatası:', dbError);
      }
    });

    // Auth failure
    global.waClient.on('auth_failure', async (msg: string) => {
      console.error('[WA] Auth failure:', msg);
      global.waIsReady = false;
      global.waLastQR = null;
      
      const oldClient = global.waClient;
      global.waClient = null;
      
      if (oldClient) {
        try {
          await oldClient.destroy();
        } catch (e) {
          // ignore
        }
      }
    });
  };

  // İlk event handler'ları kur
  setupEventHandlers();

  // Initialize - Retry mekanizması ile
  const maxRetries = 3;
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[WA] Client initialize ediliyor... (Deneme ${attempt}/${maxRetries})`);
      
      // Initialize'i timeout ile sarmala (60 saniye - navigation için yeterli)
      const initializePromise = global.waClient.initialize();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialize timeout - 60 saniye içinde tamamlanamadı')), 60000);
      });
      
      await Promise.race([initializePromise, timeoutPromise]);
      console.log('[WA] Initialize tamamlandı - QR kod bekleniyor...');
      
      // QR kod event handler zaten kuruldu, otomatik kaydedilecek
      // Ekstra bekleme yok - event-based yaklaşım kullanılıyor
      
      return { success: true };
    } catch (error: any) {
      lastError = error;
      console.error(`[WA] Initialize hatası (Deneme ${attempt}/${maxRetries}):`, error.message);
      
      // Execution context hatası ise ve son deneme değilse, retry yap
      if ((error.message.includes('Execution context was destroyed') || 
           error.message.includes('Protocol error')) && 
          attempt < maxRetries) {
        console.log(`[WA] Execution context hatası, ${attempt + 1}. deneme için hazırlanıyor...`);
        
        // Client'ı temizle
        try {
          if (global.waClient) {
            await global.waClient.destroy().catch(() => {});
          }
        } catch (e) {
          // ignore
        }
        
        global.waClient = null;
        global.waIsReady = false;
        global.waLastQR = null;
        global.waConnectedPhone = null;
        
        // SingletonLock'u temizle
        await cleanupSingletonLock();
        
        // Kısa bekleme (2 saniye)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Yeni client oluştur
        console.log('[WA] Yeni client oluşturuluyor...');
        global.waClient = new Client({
          authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
          puppeteer: {
            headless: headlessMode,
            executablePath: chromePath,
            args: baseArgs,
            timeout: 60000,
            protocolTimeout: 120000
          },
          webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
          },
          qrMaxRetries: 5,
          takeoverOnConflict: true,
          takeoverTimeoutMs: 0,
          restartOnAuthFail: true,
          authTimeoutMs: 60000
        });
        
        // Event handler'ları yeniden kur
        setupEventHandlers();
        
        // Bir sonraki denemeye geç
        continue;
      }
      
      // Son deneme veya farklı bir hata - çık
      break;
    }
  }
  
  // Tüm denemeler başarısız
  console.error('[WA] Tüm initialize denemeleri başarısız');
  console.error('[WA] Son hata detayı:', lastError?.stack);
  
  // Client'ı temizle
  try {
    if (global.waClient) {
      await global.waClient.destroy().catch(() => {});
    }
  } catch (e) {
    // ignore
  }
  
  global.waClient = null;
  global.waIsReady = false;
  global.waLastQR = null;
  global.waConnectedPhone = null;
  
  // SingletonLock'u tekrar temizle
  await cleanupSingletonLock();
  
  // Chrome açılamadıysa özel mesaj
  if (lastError?.message.includes('Executable doesn\'t exist') || lastError?.message.includes('Could not find Chrome')) {
    return { 
      success: false, 
      error: 'Chrome bulunamadı. Lütfen Google Chrome\'u yükleyin veya Chrome yolunu kontrol edin.' 
    };
  }
  
  // Protocol error için özel mesaj
  if (lastError?.message.includes('Protocol error') || 
      lastError?.message.includes('Execution context was destroyed') ||
      lastError?.message.includes('Target closed') ||
      lastError?.message.includes('Session closed')) {
    return { 
      success: false, 
      error: 'Chrome bağlantı hatası. Lütfen "Temizle ve Yeniden Bağlan" butonunu kullanın. Eğer sorun devam ederse, Chrome\'u kapatıp tekrar deneyin.' 
    };
  }
  
  return { success: false, error: lastError?.message || 'Bilinmeyen hata' };
}

/**
 * Bağlantı durumunu getir
 */
export async function getStatus(): Promise<{ 
  connected: boolean; 
  phone: string | null; 
  hasQR: boolean;
  qrCode: string | null;
}> {
  // Önce gerçek client durumunu kontrol et
  const isClientReady = !!(global.waClient && global.waIsReady);
  let qrCode = global.waLastQR;
  let connected = isClientReady;
  let phone = global.waConnectedPhone;
  
  // Eğer client bağlı değilse, client state'ini de kontrol et
  if (global.waClient && !global.waIsReady) {
    try {
      const state = await global.waClient.getState();
      if (state === 'CONNECTED') {
        connected = true;
        global.waIsReady = true;
        // Telefon bilgisini güncelle
        try {
          const info = global.waClient.info;
          phone = info?.wid?.user || phone;
          global.waConnectedPhone = phone;
        } catch (e) {
          console.warn('[WA] Telefon bilgisi alınamadı:', e);
        }
      } else {
        // Client var ama bağlı değil
        connected = false;
        global.waIsReady = false;
      }
    } catch (stateError: any) {
      console.warn('[WA] Client state kontrolü başarısız:', stateError.message);
      // State kontrolü başarısız olduysa client bağlı değil demektir
      connected = false;
      global.waIsReady = false;
    }
  }
  
  // Eğer memory'de yoksa database'den oku (Next.js module re-import sorununu çözmek için)
  // Ama sadece gerçek client durumu yoksa
  if (!qrCode && !isClientReady && !connected) {
    try {
      const { getDefaultSession } = await import('./db/wa-web-sessions');
      const session = await getDefaultSession();
      
      if (session) {
        if (session.status === 'connected') {
          // Database'de connected var ama client yoksa, gerçek durum disconnected
          // Sadece phone bilgisini al
          phone = session.phone_number || null;
          connected = false; // Gerçek client bağlı değil
        } else if (session.status === 'qr_pending' && session.qr_code) {
          qrCode = session.qr_code;
          // Memory'e de kaydet
          global.waLastQR = session.qr_code;
        }
      }
    } catch (dbError) {
      console.error('[WA] Database okuma hatası:', dbError);
      // Database hatası kritik değil, memory'den devam et
    }
  }
  
  return {
    connected,
    phone,
    hasQR: !!qrCode,
    qrCode
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
        // URL'den medya oluştur - Önce indirip base64'e çevir (daha güvenilir)
        console.log('[WA] URL\'den medya indiriliyor:', media.data);
        try {
          // URL erişilebilir mi kontrol et
          const urlTest = await fetch(media.data, { method: 'HEAD' });
          if (!urlTest.ok) {
            throw new Error(`Medya URL'si erişilemiyor: ${urlTest.status} ${urlTest.statusText}`);
          }
          
          // Medyayı indir (timeout ile) - Önce indirip base64'e çevir (daha güvenilir)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout
          
          let base64Data: string;
          let contentType: string;
          
          try {
            const response = await fetch(media.data, { 
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`Medya indirilemedi: ${response.status} ${response.statusText}`);
            }
            
            // Medya boyutunu kontrol et (max 50MB)
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
              throw new Error('Medya dosyası çok büyük (max 50MB)');
            }
            
            // MIME type'ı belirle
            contentType = response.headers.get('content-type') || 
              (media.type === 'image' ? 'image/jpeg' : 
               media.type === 'video' ? 'video/mp4' : 
               media.type === 'audio' ? 'audio/mpeg' : 
               'application/octet-stream');
            
            // Buffer'a çevir
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Boyut kontrolü (gerçek boyut)
            if (buffer.length > 50 * 1024 * 1024) {
              throw new Error('Medya dosyası çok büyük (max 50MB)');
            }
            
            base64Data = buffer.toString('base64');
            
            console.log('[WA] Medya indirildi, boyut:', (buffer.length / 1024 / 1024).toFixed(2), 'MB, MIME:', contentType);
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              throw new Error('Medya indirme timeout - 30 saniye içinde indirilemedi');
            }
            throw fetchError;
          }
          
          // MessageMedia oluştur
          mediaObj = new MessageMedia(
            contentType,
            base64Data,
            media.filename || `file.${media.type === 'image' ? 'jpg' : media.type === 'video' ? 'mp4' : 'pdf'}`
          );
          
          console.log('[WA] Medya URL\'den indirildi ve base64\'e çevrildi, tip:', media.type, 'MIME:', contentType);
        } catch (urlError: any) {
          console.error('[WA] URL\'den medya indirme hatası:', urlError.message);
          
          // Fallback: MessageMedia.fromUrl() dene
          console.log('[WA] Fallback: MessageMedia.fromUrl() deneniyor...');
          try {
            mediaObj = await MessageMedia.fromUrl(media.data, { 
              unsafeMime: true,
              filename: media.filename
            });
            console.log('[WA] Fallback başarılı: Medya URL\'den yüklendi');
          } catch (fallbackError: any) {
            console.error('[WA] Fallback de başarısız:', fallbackError.message);
            throw new Error(`Medya yüklenemedi: ${urlError.message}. Fallback hatası: ${fallbackError.message}`);
          }
        }
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
        
        try {
          mediaObj = new MessageMedia(
            mimeTypes[media.type] || 'application/octet-stream',
            base64Data,
            media.filename || `file.${media.type === 'image' ? 'jpg' : media.type === 'video' ? 'mp4' : 'pdf'}`
          );
          console.log('[WA] Medya base64\'ten oluşturuldu, tip:', media.type);
        } catch (base64Error: any) {
          console.error('[WA] Base64 medya oluşturma hatası:', base64Error.message);
          throw new Error(`Medya oluşturulamadı: ${base64Error.message}`);
        }
      }

      console.log('[WA] Medya gönderiliyor:', formattedPhone, media.type, 'MIME:', mediaObj.mimetype);
      
      // Medya ile birlikte mesaj gönder (retry ile timeout)
      let retries = 3; // 3 deneme
      let lastError: any = null;
      
      while (retries > 0) {
        try {
          // Timeout ile sarmala (30 saniye)
          const sendPromise = global.waClient.sendMessage(formattedPhone, mediaObj, {
            caption: media.caption || message || undefined
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Medya gönderme timeout - 30 saniye içinde tamamlanamadı')), 30000);
          });
          
          result = await Promise.race([sendPromise, timeoutPromise]);
          lastError = null;
          break; // Başarılı, döngüden çık
        } catch (sendError: any) {
          lastError = sendError;
          retries--;
          
          console.warn(`[WA] Medya gönderme hatası (${retries} deneme kaldı):`, sendError.message);
          
          if (sendError.message.includes('Evaluation failed') || 
              sendError.message.includes('Protocol error') ||
              sendError.message.includes('timeout')) {
            
            if (retries > 0) {
              // Biraz bekle ve tekrar dene (her denemede daha uzun bekle)
              const waitTime = (4 - retries) * 2000; // 2s, 4s, 6s
              console.log(`[WA] ${waitTime}ms bekleniyor ve tekrar denenecek...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          
          // Kritik hata veya deneme bitti, retry yapma
          throw sendError;
        }
      }
      
      if (lastError) {
        throw lastError;
      }
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
    
    // Evaluation failed hatası için özel mesaj
    if (error.message.includes('Evaluation failed')) {
      return { 
        success: false, 
        error: 'WhatsApp Web medya gönderiminde hata. Lütfen medya dosyasını kontrol edin veya tekrar deneyin. Sorun devam ederse Chrome\'u yeniden başlatın.' 
      };
    }
    
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
    
    return { success: false, error: error.message || 'Bilinmeyen hata' };
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
    console.log('[WA] İlk medya gönderiliyor (1/', mediaItems.length, ')');
    const firstResult = await sendMessage(
      phone,
      message,
      mediaItems[0]
    );

    if (!firstResult.success) {
      console.error('[WA] İlk medya gönderilemedi:', firstResult.error);
      return { success: false, error: `İlk medya gönderilemedi: ${firstResult.error}` };
    }

    if (firstResult.messageId) {
      messageIds.push(firstResult.messageId);
      console.log('[WA] İlk medya başarıyla gönderildi');
    }

    // Kalan medyaları sırayla gönder
    for (let i = 1; i < mediaItems.length; i++) {
      // Mesajlar arası bekleme (ban önleme)
      await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));

      console.log(`[WA] Medya ${i + 1}/${mediaItems.length} gönderiliyor...`);
      const caption = mediaItems[i].caption || `${i + 1}/${mediaItems.length}`;
      const result = await sendMessage(phone, '', mediaItems[i]);

      if (result.success && result.messageId) {
        messageIds.push(result.messageId);
        console.log(`[WA] Medya ${i + 1}/${mediaItems.length} başarıyla gönderildi`);
      } else {
        console.error(`[WA] Medya ${i + 1}/${mediaItems.length} gönderilemedi:`, result.error);
        // Bir medya başarısız olsa bile devam et
      }
    }

    console.log('[WA] Çoklu medya gönderimi tamamlandı:', messageIds.length, '/', mediaItems.length);
    return { success: true, messageIds };
  } catch (error: any) {
    console.error('[WA] Çoklu medya gönderme hatası:', error.message);
    console.error('[WA] Hata stack:', error.stack);
    
    // Evaluation failed hatası için özel mesaj
    if (error.message.includes('Evaluation failed')) {
      return { 
        success: false, 
        error: 'WhatsApp Web medya gönderiminde hata. Lütfen medya dosyalarını kontrol edin veya tekrar deneyin.' 
      };
    }
    
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
    
    return { success: false, error: error.message || 'Bilinmeyen hata' };
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
  
  // SingletonLock'u temizle
  await cleanupSingletonLock();
  
  // IndexedDB cache'ini temizle (opsiyonel - sadece sorun varsa)
  // cleanupIndexedDBCache(); // Yorum satırı - sadece gerektiğinde aç
  
  console.log('[WA] Client kapatıldı ve temizlendi');
}

/**
 * WhatsApp Web oturumunu kapat (logout)
 */
export async function logoutWaWeb(): Promise<void> {
  await destroyClient();
  
  // IndexedDB cache'ini de temizle (tam temizlik için)
  cleanupIndexedDBCache();
  
  // Database'den session'ı temizle
  try {
    const { resetSession } = await import('./db/wa-web-sessions');
    await resetSession('default');
    console.log('[WA] Session database\'den temizlendi');
  } catch (dbError) {
    console.error('[WA] Database temizleme hatası:', dbError);
  }
}

/**
 * Kişileri getir
 * Not: getContacts() eski API kullanıyor, getChats() kullanarak kişileri çekiyoruz
 */
export async function getContacts(): Promise<any[]> {
  if (!global.waClient || !global.waIsReady) {
    throw new Error('WhatsApp bağlı değil. Lütfen önce bağlantı kurun.');
  }

  try {
    console.log('[WA] Kişiler alınıyor (getChats kullanılarak)...');
    
    // getChats() kullanarak tüm sohbetleri al (kişiler ve gruplar)
    const chats = await global.waClient.getChats();
    console.log(`[WA] Toplam ${chats.length} sohbet bulundu`);
    
    // Sadece kişi sohbetlerini filtrele (grupları hariç tut)
    const contactChats = chats.filter((chat: any) => !chat.isGroup);
    console.log(`[WA] ${contactChats.length} kişi sohbeti bulundu`);
    
    // Her sohbetten kişi bilgilerini çıkar
    const contacts = await Promise.all(
      contactChats.map(async (chat: any) => {
        try {
          // Chat'ten contact ID'yi al
          const contactId = chat.id._serialized;
          
          // Contact bilgilerini al
          let contact;
          try {
            contact = await global.waClient.getContactById(contactId);
          } catch (e) {
            // Contact alınamazsa chat bilgilerini kullan
            console.warn(`[WA] Contact bilgisi alınamadı: ${contactId}, chat bilgileri kullanılıyor`);
            contact = null;
          }
          
          // Telefon numarasını çıkar
          const phone = contactId.split('@')[0];
          
          return {
            id: contactId,
            name: contact?.name || contact?.pushname || chat.name || phone,
            phone: phone
          };
        } catch (error: any) {
          console.error(`[WA] Kişi işleme hatası:`, error);
          // Hata durumunda minimal bilgi döndür
          const phone = chat.id._serialized.split('@')[0];
          return {
            id: chat.id._serialized,
            name: chat.name || phone,
            phone: phone
          };
        }
      })
    );
    
    // Geçerli telefon numaralarına sahip kişileri filtrele
    const filteredContacts = contacts.filter((c: any) => {
      return c.phone && c.phone.length > 5 && !c.phone.includes('g.us'); // Grup ID'lerini hariç tut
    });
    
    console.log(`[WA] ${filteredContacts.length} geçerli kişi filtrelendi`);
    return filteredContacts;
  } catch (error: any) {
    console.error('[WA] Kişiler alınamadı:', error.message);
    throw new Error(`Kişiler alınamadı: ${error.message}`);
  }
}

/**
 * Grupları getir
 */
export async function getGroups(): Promise<any[]> {
  if (!global.waClient || !global.waIsReady) {
    throw new Error('WhatsApp bağlı değil. Lütfen önce bağlantı kurun.');
  }

  try {
    console.log('[WA] Gruplar alınıyor...');
    const chats = await global.waClient.getChats();
    const groups = chats
      .filter((c: any) => c.isGroup)
      .map((c: any) => ({
        id: c.id._serialized,
        name: c.name,
        participantCount: c.participants?.length || 0
      }));
    console.log(`[WA] ${groups.length} grup bulundu`);
    return groups;
  } catch (error: any) {
    console.error('[WA] Gruplar alınamadı:', error.message);
    throw new Error(`Gruplar alınamadı: ${error.message}`);
  }
}

/**
 * Belirli bir grubun üyelerini getir
 */
export async function getGroupParticipants(groupId: string): Promise<any[]> {
  if (!global.waClient || !global.waIsReady) {
    return [];
  }

  try {
    const chat = await global.waClient.getChatById(groupId);
    
    if (!chat.isGroup) {
      console.log('[WA] Bu bir grup değil:', groupId);
      return [];
    }

    const participants = chat.participants || [];
    console.log(`[WA] Grup "${chat.name}" için ${participants.length} katılımcı bulundu`);
    
    if (participants.length === 0) {
      return [];
    }
    
    // Her katılımcı için detaylı bilgi al (timeout ile)
    const participantDetails = await Promise.all(
      participants.map(async (participant: any) => {
        try {
          // Telefon numarasını çıkar
          const phone = participant.id?.user || participant.id?._serialized?.split('@')[0] || '';
          
          // Contact bilgilerini al (hata durumunda minimal bilgi)
          let name = phone;
          let isAdmin = false;
          let isSuperAdmin = false;
          
          try {
            const contact = await global.waClient.getContactById(participant.id._serialized);
            name = contact.name || contact.pushname || phone;
          } catch (contactError) {
            // Contact alınamazsa participant bilgilerini kullan
            name = participant.name || phone;
          }
          
          // Admin bilgilerini al
          try {
            isAdmin = participant.isAdmin || false;
            isSuperAdmin = participant.isSuperAdmin || false;
          } catch (e) {
            // Admin bilgisi alınamazsa false olarak ayarla
          }
          
          return {
            id: participant.id._serialized,
            phone: phone,
            name: name,
            isAdmin: isAdmin,
            isSuperAdmin: isSuperAdmin
          };
        } catch (error: any) {
          console.error('[WA] Katılımcı bilgisi alınamadı:', participant.id?._serialized, error.message);
          // Hata durumunda minimal bilgi döndür
          const phone = participant.id?.user || participant.id?._serialized?.split('@')[0] || 'unknown';
          return {
            id: participant.id?._serialized || `unknown@${phone}`,
            phone: phone,
            name: phone,
            isAdmin: false,
            isSuperAdmin: false
          };
        }
      })
    );

    // Geçerli katılımcıları filtrele
    const validParticipants = participantDetails.filter(p => p.phone && p.phone.length > 5);
    console.log(`[WA] ${validParticipants.length} geçerli katılımcı filtrelendi`);
    
    return validParticipants;
  } catch (error: any) {
    console.error('[WA] Grup üyeleri alınamadı:', error.message);
    return [];
  }
}

/**
 * Tüm grupları üyeleriyle birlikte getir
 */
export async function getGroupsWithParticipants(): Promise<any[]> {
  if (!global.waClient || !global.waIsReady) {
    throw new Error('WhatsApp bağlı değil. Lütfen önce bağlantı kurun.');
  }

  try {
    console.log('[WA] Gruplar ve üyeler alınıyor...');
    const chats = await global.waClient.getChats();
    const groups = chats.filter((c: any) => c.isGroup);
    console.log(`[WA] ${groups.length} grup bulundu`);

    if (groups.length === 0) {
      console.log('[WA] Hiç grup bulunamadı');
      return [];
    }

    const groupsWithParticipants = await Promise.all(
      groups.map(async (group: any) => {
        try {
          const participants = await getGroupParticipants(group.id._serialized);
          console.log(`[WA] Grup "${group.name}": ${participants.length} üye`);
          
          return {
            id: group.id._serialized,
            name: group.name || 'İsimsiz Grup',
            participantCount: participants.length,
            participants: participants
          };
        } catch (error: any) {
          console.error(`[WA] Grup "${group.name}" işlenirken hata:`, error.message);
          // Hata durumunda minimal bilgi döndür
          return {
            id: group.id._serialized,
            name: group.name || 'İsimsiz Grup',
            participantCount: 0,
            participants: []
          };
        }
      })
    );

    // Boş olmayan grupları filtrele
    const validGroups = groupsWithParticipants.filter(g => g.participants.length > 0 || g.name !== 'İsimsiz Grup');
    
    console.log(`[WA] Toplam ${validGroups.length} grup ve üyeleri alındı`);
    return validGroups;
  } catch (error: any) {
    console.error('[WA] Gruplar ve üyeler alınamadı:', error.message);
    throw new Error(`Gruplar ve üyeler alınamadı: ${error.message}`);
  }
}
