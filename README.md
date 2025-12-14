# WhatsApp Yoncu Panel 🚀

Modern, full-stack WhatsApp mesaj gönderme ve yönetim paneli.  
**İki kanal desteği:** YoncuAPI (Business API) + WhatsApp Web/Desktop

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-green)](https://supabase.com/)

## ✨ Özellikler

### 🆕 Yeni: WhatsApp Web/Desktop Kanalı
- 📱 **WA Web Entegrasyonu** - Kendi WhatsApp hesabınızla gönderim
- 📲 **QR ile Oturum** - Kolay bağlantı ve oturum yönetimi
- 👥 **Kişi/Grup Listeleme** - WA Web kişilerinizi ve gruplarınızı görün
- 🎯 **Kampanya Yönetimi** - Toplu gönderim kampanyaları oluşturun
- 🔍 **Ön İzleme** - Göndermeden önce mesajları kontrol edin
- 🛡️ **Ban Risk Kontrolleri** - Uyum ve kalite kontrolleri
- 📊 **Detaylı Raporlama** - Gerçek zamanlı gönderim istatistikleri
- ⚙️ **Rate Limiting** - Güvenli gönderim hızı profilleri

### Mesajlaşma (Business API)
- 📱 **Tekil Mesaj Gönderimi** - Kayıtlı veya kayıtsız numaralara
- 👥 **Toplu Mesaj Gönderimi** - Çoklu kişiye aynı anda (1-2 saniye gecikme ile)
- 👨‍👩‍👧‍👦 **Grup Bazlı Gönderim** - Gruplara toplu mesaj gönderimi
- 📎 **Medya Gönderimi** - Görsel, video, belge ve ses dosyası ekleme (Max 50MB)
- 📊 **İlerleme Takibi** - Gerçek zamanlı gönderim durumu
- ⏱️ **Kuyruk Yönetimi** - Bekleyen mesajları görüntüleme (otomatik yenileme)

### Kişi Yönetimi
- 👤 **CRUD İşlemleri** - Kişi ekle, düzenle, sil, listele
- ✅ **Toplu Seçim ve Silme** - Çoklu kişi seçerek tek seferde silme
- 📄 **CSV İçe Aktarma** - Toplu kişi ekleme (hata raporlaması ile)
- 🔍 **Arama ve Filtreleme** - Hızlı kişi bulma
- 📞 **Akıllı Telefon Formatı** - Tüm Türkiye formatlarını otomatik algılama (+905XX, 905XX, 05XX, 5XX)

### Grup Yönetimi
- 📁 **Grup Oluşturma** - Kişileri gruplara ayırma
- ✅ **Çoklu Seçim** - Gruba toplu kişi ekleme (Tümünü Seç özelliği ile)
- 👥 **Grup İçeriği** - Gruptaki kişileri görüntüleme ve yönetme
- 🗑️ **Kişi Çıkarma** - Gruptan kişi çıkarma
- 📊 **İstatistikler** - Grup başına kişi sayısı

### Şablon Sistemi
- 📝 **Şablon Yönetimi** - Mesaj şablonları oluştur ve yönet
- 🏷️ **{name} Placeholder** - Kişiye özel mesajlar
- 📎 **Medya Desteği** - Görsel, video, belge ve ses dosyası ekleme
- 👁️ **Önizleme** - Şablon ve medya önizlemesi
- 🎨 **Zengin Editor** - Kolay şablon düzenleme

### İzleme ve Raporlama
- 📈 **Mesaj Geçmişi** - Tüm gönderilen mesajlar
- 🔍 **Gelişmiş Arama** - Telefon, mesaj veya kişi adına göre
- 📊 **İstatistikler** - Başarılı/başarısız mesaj sayıları
- ⏰ **Tarih Filtreleme** - Tarih aralığına göre filtreleme

### Kullanıcı Deneyimi
- 🎨 **Modern UI** - Shadcn/ui ile profesyonel tasarım
- 🌙 **Dark/Light Mode** - Tema desteği
- 📱 **Fully Responsive** - Mobil öncelikli tasarım
- ⚡ **Hızlı ve Akıcı** - Framer Motion animasyonları
- 🔔 **Toast Bildirimleri** - Kullanıcı friendly feedback

### Güvenlik ve Ayarlar
- 🔐 **Authentication** - Secure login sistemi
- ⚙️ **API Konfigürasyonu** - Kolay YoncuAPI ayarları
- ✅ **Bağlantı Testi** - Servis durumu kontrolü
- 👤 **Kullanıcı Yönetimi** - Şifre ve kullanıcı adı değiştirme

## 🛠️ Teknoloji Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend & Database
- **Database:** Supabase (PostgreSQL)
- **ORM:** Supabase Client
- **API Routes:** Next.js API Routes
- **External APIs:** 
  - YoncuAPI (Business API)
  - whatsapp-web.js (WA Web/Desktop)

### WhatsApp Entegrasyonları
- **Business API:** YoncuAPI
- **WhatsApp Web:** whatsapp-web.js + Puppeteer
- **Utilities:** QRCode, Pino (logging)

### Development
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript

## 🚀 Hızlı Başlangıç

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/yourusername/whatsapp-yoncu.git
cd whatsapp-yoncu
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env.local` dosyası oluşturun (`.env.local.example` dosyasından kopyalayın):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
YONCU_API_BASE_URL=https://www.yoncu.com
NODE_ENV=development
```

### 4. Supabase Kurulumu

**Mevcut projeyseniz:**  
Detaylı Supabase kurulum talimatları için [SUPABASE_SETUP.md](SUPABASE_SETUP.md) dosyasına bakın.

**WhatsApp Web/Desktop kanalını eklemek için:**
1. [database-migration-wa-web.sql](database-migration-wa-web.sql) dosyasını açın
2. Tüm SQL kodunu Supabase SQL Editor'da çalıştırın
3. Yeni tablolar ve alanlar otomatik oluşturulacak

Kısaca:
1. Supabase hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'da database tablolarını oluşturun (SUPABASE_SETUP.md'de SQL kodu var)
4. API anahtarlarını `.env.local` dosyasına ekleyin

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### 6. İlk Giriş

- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`

⚠️ **Önemli:** İlk girişten sonra şifrenizi değiştirin!

## 📖 Kullanım Kılavuzu

### 🆕 WhatsApp Web/Desktop Kanalı Kurulumu

WhatsApp Web/Desktop kanalının detaylı kurulum ve kullanım kılavuzu için:  
👉 **[WA_WEB_SETUP.md](WA_WEB_SETUP.md)** dosyasına bakın

**Hızlı Başlangıç:**
1. Dashboard'da **"WA Web Oturumu"** sekmesine gidin
2. **"Bağlan"** butonuna tıklayın ve QR kodu tarayın
3. **"Kampanyalar"** sekmesinden yeni kampanya oluşturun
4. Ön izleme yapın ve gönderin
5. **"Raporlar"** sekmesinden sonuçları izleyin

### API Ayarlarını Yapılandırma (Business API)

1. Dashboard'a giriş yapın
2. **Ayarlar** menüsüne gidin
3. Yoncu panelinizdeki **Service ID** ve **Authorization Token** bilgilerini girin
4. **Kaydet** butonuna tıklayın
5. **Bağlantıyı Test Et** ile servisin aktif olduğunu kontrol edin

### Kişi Ekleme

**Manuel Ekleme:**
1. **Kişiler** sayfasına gidin
2. **Yeni Kişi** butonuna tıklayın
3. Ad, soyad ve telefon bilgilerini girin
4. **Kaydet**

**CSV ile Toplu Ekleme:**
1. **CSV İçe Aktar** butonuna tıklayın
2. **Şablon İndir** ile örnek dosyayı indirin
3. Excel'de doldurun ve CSV olarak kaydedin
4. Dosyayı yükleyin ve **İçe Aktar**

**Desteklenen Telefon Formatları:**
- `+905426738234` (Uluslararası)
- `905426738234` (90 ile başlayan)
- `05426738234` (0 ile başlayan)
- `5426738234` (Sadece 10 hane)

⚡ **Not:** Tüm formatlar otomatik olarak `+905XXXXXXXXX` formatına dönüştürülür.

**Toplu Silme:**
1. Kişiler tablosunda silmek istediğiniz kişileri checkbox ile işaretleyin
2. **Seçilenleri Sil** butonuna tıklayın
3. Onaylayın

### Grup Yönetimi

**Grup Oluşturma:**
1. **Gruplar** sayfasına gidin
2. **Yeni Grup** butonuna tıklayın
3. Grup adı ve açıklama girin
4. **Oluştur**

**Gruba Kişi Ekleme:**
1. Grup kartında **Kişi Ekle** (➕) ikonuna tıklayın
2. Eklenecek kişileri seçin (Tümünü Seç butonu ile hepsini seçebilirsiniz)
3. **Kişiyi Ekle** butonuna tıklayın

**Grup Kişilerini Görüntüleme:**
1. Grup kartında **Görüntüle** butonuna tıklayın
2. Gruptaki kişileri görün
3. İstenmeyen kişileri çıkarmak için çöp kutusu ikonuna tıklayın

### Mesaj Şablonu Oluşturma

1. **Şablonlar** sayfasına gidin
2. **Yeni Şablon** butonuna tıklayın
3. Şablon adı ve içeriği girin
4. `{name}`, `{surname}`, `{email}`, `{address}`, `{company}` kullanarak kişiye özel mesaj oluşturun
5. **(Opsiyonel)** Medya dosyası ekleyin:
   - Görsel (JPG, PNG, GIF, WebP)
   - Video (MP4, AVI, MOV, WebM)
   - Belge (PDF, DOC, XLS, PPT, TXT)
   - Ses (MP3, WAV, OGG, AAC)
   - Max dosya boyutu: 50MB
6. **Önizle** ile sonucu görün
7. **Kaydet**

### Mesaj Gönderme

**Tekil Gönderim:**
1. **Mesaj Gönder** > **Tekil Gönderim**
2. Kişi seçin veya telefon numarası girin
3. Şablon seçin (medya dahil) veya manuel mesaj yazın
4. **(Opsiyonel)** Medya dosyası ekleyin (görsel, video, belge, ses)
5. **Mesajı Gönder**

**Çoğul Gönderim:**
1. **Mesaj Gönder** > **Çoğul Gönderim**
2. **ÜÇ FARKLI YOL:**
   - **Grup Seçimi:** Grup dropdown'ından bir grup seçin (gruptaki tüm kişiler otomatik eklenir)
   - **Manuel Seçim:** Kayıtlı kişilerden istediğinizi seçin
   - **Toplu Numara:** Telefon numaralarını alt alta girin
3. Şablon seçin (opsiyonel, medya dahil)
4. **(Opsiyonel)** Medya dosyası ekleyin - aynı dosya tüm alıcılara gönderilir
5. **Toplu Gönder**

⚡ **Kişiselleştirme:** Mesajınızda `{name}`, `{surname}`, `{email}`, `{address}`, `{company}` placeholder'larını kullanarak kişiye özel mesajlar oluşturabilirsiniz.

📎 **Medya Desteği:** Her mesajla birlikte görsel, video, belge veya ses dosyası gönderebilirsiniz. Dosya şablonla birlikte kaydedilir veya anlık eklenebilir.

## 🆕 Yeni Özellikler (v2.0)

### WhatsApp Web/Desktop Entegrasyonu
- `whatsapp-web.js` kullanılarak kendi WhatsApp hesabınızla gönderim
- QR kod ile kolay oturum açma
- Kişi ve grup listeleme + CSV export
- Kampanya tabanlı toplu gönderim sistemi
- Mesaj ön izleme ve kişiselleştirme
- Ban riskini azaltan uyum kontrolleri:
  - Opt-in/consent zorunluluğu
  - Blacklist yönetimi (STOP/İPTAL)
  - İçerik kalite kontrolleri
  - Rate limiting ve kademeli gönderim
- Detaylı raporlama ve analiz
- Başarılı/başarısız mesaj takibi

### Yeni Sayfalar
- **WA Web Oturumu** - QR ile bağlantı ve kişi/grup yönetimi
- **Kampanyalar** - Toplu gönderim kampanyaları oluştur
- **Raporlar** - Detaylı kampanya raporları ve istatistikler

## 📁 Proje Yapısı

```
whatsapp-yoncu/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth sayfaları (login)
│   ├── (dashboard)/         # Dashboard sayfaları
│   │   ├── kisiler/         # Kişiler modülü
│   │   ├── gruplar/         # Gruplar modülü (YENİ!)
│   │   ├── sablonlar/       # Şablonlar modülü
│   │   ├── mesaj-gonder/    # Mesaj gönderimi
│   │   ├── kuyruk/          # Kuyruk yönetimi
│   │   ├── gecmis/          # Mesaj geçmişi
│   │   ├── wa-web-session/  # WhatsApp Web Oturumu (YENİ!)
│   │   ├── campaigns/       # Kampanya yönetimi (YENİ!)
│   │   ├── reports/         # Kampanya raporları (YENİ!)
│   │   └── ayarlar/         # Ayarlar
│   ├── api/                 # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── contacts/        # Kişiler API
│   │   ├── groups/          # Gruplar API
│   │   ├── templates/       # Şablonlar API
│   │   ├── yoncu/           # YoncuAPI proxy
│   │   ├── wa-web/          # WhatsApp Web API (YENİ!)
│   │   ├── campaigns/       # Kampanya API (YENİ!)
│   │   └── ...
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/              # React bileşenleri
│   ├── ui/                  # Shadcn/ui bileşenleri
│   ├── layout/              # Layout bileşenleri
│   ├── contacts/            # Kişiler bileşenleri
│   ├── templates/           # Şablon bileşenleri
│   └── messaging/           # Mesajlaşma bileşenleri
├── lib/                     # Utility fonksiyonlar
│   ├── db/                  # Database helpers
│   │   ├── campaigns.ts     # Campaign DB işlemleri (YENİ!)
│   │   ├── wa-web-sessions.ts  # Session DB (YENİ!)
│   │   └── blacklist.ts     # Blacklist DB (YENİ!)
│   ├── supabase.ts          # Supabase client
│   ├── yoncu-api.ts         # YoncuAPI client
│   ├── wa-web-service.ts    # WhatsApp Web service (YENİ!)
│   ├── compliance-service.ts   # Uyum kontrolleri (YENİ!)
│   ├── csv-parser.ts        # CSV işlemleri
│   └── utils.ts             # Genel utilities
├── types/                   # TypeScript type tanımları
└── public/                  # Static dosyalar
```

## 🚢 Deployment

Detaylı deployment talimatları için [DEPLOYMENT.md](DEPLOYMENT.md) dosyasına bakın.

### Vercel'e Deploy (Önerilen)

1. GitHub'a push edin
2. Vercel'e giriş yapın
3. Repository'yi import edin
4. Environment variables ekleyin
5. Deploy!

```bash
vercel deploy --prod
```

## 🔒 Güvenlik

- ⚠️ **Production Öncesi:** Supabase RLS (Row Level Security) politikalarını mutlaka ekleyin
- 🔐 **Şifre Güvenliği:** Şu anda şifreler düz metin olarak saklanıyor - production için bcrypt kullanın
- 🛡️ **API Güvenliği:** Rate limiting ve CORS ayarlarını yapılandırın
- 🔑 **Environment Variables:** Hassas bilgileri asla repository'ye eklemeyin

## 📝 Özelleştirme

### Renk Teması Değiştirme

`tailwind.config.ts` dosyasındaki primary rengini değiştirin:

```typescript
primary: {
  DEFAULT: "#0bdb3b", // Buradan değiştirin
  // ...
}
```

### Yeni Modül Ekleme

1. `app/(dashboard)/dashboard/` altında yeni klasör oluşturun
2. `components/` altında ilgili bileşenleri ekleyin
3. `lib/db/` altında database helper'ları oluşturun
4. `components/layout/sidebar.tsx` içine menü elemanını ekleyin

## 🐛 Sorun Giderme

### Build Hatası

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Supabase Bağlantı Hatası

- `.env.local` dosyasının doğru konumda olduğunu kontrol edin
- Supabase URL ve Key'in doğru olduğunu onaylayın
- Supabase projesinin aktif olduğunu kontrol edin

### YoncuAPI Bağlantı Hatası

- Ayarlar sayfasından Service ID ve Auth Token'ı kontrol edin
- **Bağlantıyı Test Et** butonunu kullanın
- YoncuAPI servisinin aktif olduğunu onaylayın

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

Geliştirici: **Vibe Coding AI**

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [YoncuAPI](https://www.yoncu.com/)

---

**Not:** Bu proje eğitim amaçlıdır. Production kullanımı için ek güvenlik önlemleri almanız önerilir.

