# WhatsApp Web/Desktop Kanal Kurulum Kılavuzu

## 🚀 Hızlı Başlangıç

Bu kılavuz, WhatsApp Web/Desktop kanalının kurulumu ve kullanımını adım adım açıklar.

## 📋 Ön Gereksinimler

- Node.js 18+ veya 20+
- Mevcut WhatsApp hesabı (telefon numaranız)
- Supabase projesi kurulu olmalı
- Chromium/Chrome tarayıcı (Puppeteer tarafından otomatik indirilir)

## 🗄️ Database Migration

İlk olarak, yeni tabloları Supabase'e ekleyin:

1. Supabase Dashboard'a gidin
2. **SQL Editor** sekmesine tıklayın
3. `database-migration-wa-web.sql` dosyasındaki tüm SQL kodunu kopyalayın ve çalıştırın

Migration şunları oluşturur:
- ✅ `wa_web_sessions` - WhatsApp Web oturum bilgileri
- ✅ `campaigns` - Toplu gönderim kampanyaları
- ✅ `send_jobs` - Mesaj kuyruğu ve gönderim durumu
- ✅ `blacklist` - STOP/İPTAL listesi
- ✅ `contacts` tablosuna `consent` alanları ekler

## 📦 Bağımlılıkları Yükleyin

```bash
npm install
```

Yeni eklenen paketler:
- `whatsapp-web.js` - WhatsApp Web client
- `qrcode` - QR kod üretimi
- `pino` - Loglama
- `@radix-ui/react-tabs` - UI component

## ⚙️ Ortam Değişkenleri

`.env.local` dosyanızı kontrol edin (`.env.example` dosyasından kopyalayın):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
YONCU_API_BASE_URL=https://www.yoncu.com
```

## 🚀 Uygulamayı Başlatın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📱 WhatsApp Web Oturumu Açma

### Adım 1: WA Web Session Sayfasına Gidin

Dashboard'da yan menüden **"WA Web Oturumu"** sekmesine tıklayın.

### Adım 2: Bağlantıyı Başlatın

1. **"Bağlan"** butonuna tıklayın
2. Birkaç saniye içinde QR kodu ekranda belirecektir

### Adım 3: QR Kodu Tarayın

1. Telefonunuzda WhatsApp uygulamasını açın
2. **Ayarlar** > **Bağlı Cihazlar** > **Cihaz Bağla**
3. Ekrandaki QR kodu tarayın

### Adım 4: Bağlantı Onayı

QR kod tarandıktan sonra:
- Durum "Bağlı" olarak değişecek
- Telefon numaranız görünecek
- Artık kişileri ve grupları görüntüleyebilirsiniz

## 👥 Kişileri ve Grupları Getirme

### Kişileri Getir

1. "Kişileri Getir" butonuna tıklayın
2. WhatsApp'taki tüm kişileriniz listelenecek
3. "CSV İndir" ile kişileri dışa aktarabilirsiniz

### Grupları Getir

1. "Grupları Getir" butonuna tıklayın
2. Üye olduğunuz tüm gruplar listelenecek

## 🎯 Kampanya Oluşturma ve Gönderim

### Adım 1: Yeni Kampanya Oluştur

1. Dashboard'da **"Kampanyalar"** sekmesine gidin
2. **"Yeni Kampanya"** butonuna tıklayın

### Adım 2: Kampanya Detaylarını Doldurun

**Zorunlu Alanlar:**
- **Kampanya Adı**: Tanımlayıcı bir isim
- **Gönderim Kanalı**: "WhatsApp Web/Desktop" seçin
- **Mesaj Şablonu**: Gönderilecek mesaj

**Mesaj Değişkenleri:**
- `{name}` - Alıcının adı
- `{surname}` - Alıcının soyadı
- `{email}` - E-posta
- `{company}` - Şirket

**Örnek Mesaj:**
```
Merhaba {name},

Yeni ürünümüzü tanıtmak istiyoruz...
```

### Adım 3: Hedef Kitle Seçin

Üç seçenek:
1. **Kayıtlı Kişiler**: Veritabanınızdaki kişilerden seçim
2. **Gruplar**: Veritabanınızdaki gruplardan seçim
3. **Manuel Numara Listesi**: Her satıra bir numara yazın

### Adım 4: Gönderim Hız Profili

**Düşük Hız (Önerilen):**
- 1 mesaj/saniye
- 20 mesaj/dakika
- 2-5 saniye rastgele gecikme
- ✅ En güvenli seçenek

**Orta Hız:**
- 2 mesaj/saniye
- 60 mesaj/dakika
- ⚠️ Dikkatli kullanın

**Yüksek Hız:**
- 3 mesaj/saniye
- 120 mesaj/dakika
- ❌ Riskli, önerilmez

### Adım 5: Kampanyayı Oluşturun

"Kampanya Oluştur" butonuna tıklayın. Kampanya "Taslak" durumunda kaydedilir.

### Adım 6: Ön İzleme

1. Kampanya listesinde "Gönder" butonuna tıklayın
2. **Ön İzleme** sayfası açılır:
   - İlk 10 alıcı için kişiselleştirilmiş mesajları gösterir
   - Toplam alıcı sayısı ve tahmini süreyi gösterir
   - **Uyum kontrolleri** çalıştırılır:
     - ✅ Consent (rıza) kontrolü
     - ✅ Blacklist kontrolü
     - ✅ İçerik kalite kontrolü

### Adım 7: Onay ve Gönderim

1. Ön izleme sonuçlarını inceleyin
2. **Uyarıları** okuyun (varsa)
3. Onay kutusunu işaretleyin:
   > "Bu listedeki tüm alıcıların açık rızası olduğunu onaylıyorum..."
4. **"Kampanyayı Başlat"** butonuna tıklayın

### Adım 8: İzleme ve Raporlama

Gönderim başladıktan sonra:
- **Raporlar** sayfasından kampanyayı izleyin
- Gerçek zamanlı istatistikler:
  - Toplam gönderim
  - Başarılı mesajlar
  - Başarısız mesajlar
  - Başarı oranı
- Hata analizi ve detaylı job listesi

## 🛡️ Ban Riskini Azaltma - Uyum Kontrolleri

Sistem otomatik olarak şu kontrolleri yapar:

### 1. Consent (Rıza) Kontrolü

- `contacts` tablosunda `consent = true` olan kişilere gönderim yapılır
- Rızası olmayan kişilere gönderim engellenir

**Rıza nasıl eklenir?**
```sql
UPDATE contacts SET consent = true, consent_date = NOW(), consent_source = 'web_form' WHERE id = 'contact_id';
```

### 2. Blacklist (STOP/İPTAL) Yönetimi

- Kullanıcı "STOP", "İPTAL" veya "DURDUR" yazarsa otomatik blacklist'e eklenir
- Blacklist'teki numaralara gönderim yapılmaz

### 3. İçerik Kalite Kontrolü

**Uyarılar:**
- ⚠️ Çok fazla link (3+)
- ⚠️ Kısaltılmış linkler (bit.ly, tinyurl)
- ⚠️ Aşırı büyük harf kullanımı
- ⚠️ Tekrarlanan karakterler (!!!!, ????)
- ⚠️ Çok fazla emoji (10+)

**Hatalar:**
- ❌ Boş mesaj
- ❌ Desteklenmeyen dosya türü
- ❌ Dosya boyutu fazla (>50MB)

### 4. Rate Limiting

- Saniye başına mesaj limiti
- Dakika başına mesaj limiti
- Rastgele gecikme (jitter)
- Burst önleme

### 5. Hata Yönetimi

- 3 deneme hakkı
- Exponential backoff
- Bağlantı koparsa otomatik pause

## 📊 Raporlama ve Analiz

### Kampanya Raporu

Rapor sayfası şunları gösterir:
- 📈 İstatistikler (toplam, başarılı, başarısız)
- 🔍 Hata analizi (hangi hatalar kaç kez)
- 📋 Detaylı job listesi (tüm alıcılar ve durumları)
- 💾 CSV export

### CSV Export

İki türde CSV export:
1. **WA Web Kişiler**: "CSV İndir" (WA Web Session sayfasında)
2. **Kampanya Raporu**: "CSV İndir" (Reports sayfasında)

## ⚠️ Önemli Uyarılar

### 1. Resmi Olmayan API

WhatsApp Web/Desktop kanalı **resmi bir API değildir**. `whatsapp-web.js` kütüphanesi WhatsApp Web'in browser versiyonunu kullanır.

**Riskler:**
- WhatsApp tarafından algılanabilir
- Hesap geçici veya kalıcı olarak banlanabilir
- WhatsApp güncellemeleri kütüphaneyi bozabilir

### 2. Kullanım Kuralları

**✅ İzin Verilen:**
- Açık rızası olan kişilere mesaj
- Müşteri desteği ve bildirimler
- Kişisel kullanım (aile, arkadaşlar)

**❌ İzin Verilmeyen:**
- Rızasız toplu mesaj (spam)
- Otomatik satış/pazarlama
- Çok yüksek hacimli gönderimler
- Bot benzeri davranışlar

### 3. Best Practices

**Öneriler:**
- ✅ Düşük hız profili kullanın
- ✅ Günde max 200-300 mesaj
- ✅ Kişiselleştirilmiş mesajlar gönderin
- ✅ Opt-in/opt-out mekanizması kullanın
- ✅ Düzenli aralarla mesaj gönderin (sürekli değil)

**Kaçınılması Gerekenler:**
- ❌ Toplu pazarlama mesajları
- ❌ Aynı mesajı yüzlerce kişiye
- ❌ Çok hızlı gönderim
- ❌ Gece saatlerinde gönderim

## 🔧 Sorun Giderme

### QR Kod Görünmüyor

**Çözüm:**
1. Sayfayı yenileyin
2. "Bağlan" butonuna tekrar tıklayın
3. Browser console'u kontrol edin (F12)
4. Chromium'un yüklü olduğundan emin olun

### Bağlantı Kopuyor

**Nedenler:**
- İnternet bağlantısı kesildi
- WhatsApp Web session timeout
- Sunucu restart oldu

**Çözüm:**
1. "Oturumu Kapat" ve tekrar "Bağlan"
2. `.wwebjs_auth` klasörünü silip yeniden QR tarayın

### Mesajlar Gönderilmiyor

**Kontrol Edin:**
- [ ] WA Web bağlantısı aktif mi?
- [ ] Alıcı blacklist'te mi?
- [ ] Alıcının consent'i var mı?
- [ ] Telefon numarası doğru formatta mı?

### Performance Sorunları

**Öneriler:**
- Sunucu RAM'ini artırın (min 1GB)
- Aynı anda çok fazla kampanya çalıştırmayın
- Job'ları küçük parçalara bölün

## 📚 API Endpoint'leri

### WA Web Session

```
POST   /api/wa-web/connect       # Bağlantıyı başlat
GET    /api/wa-web/qr            # QR kodu getir
GET    /api/wa-web/status        # Durum kontrolü
POST   /api/wa-web/logout        # Oturumu kapat
GET    /api/wa-web/contacts      # Kişileri getir
GET    /api/wa-web/groups        # Grupları getir
GET    /api/wa-web/export-contacts  # CSV export
```

### Campaigns

```
GET    /api/campaigns            # Tüm kampanyalar
POST   /api/campaigns            # Yeni kampanya
GET    /api/campaigns/:id        # Kampanya detay
PATCH  /api/campaigns/:id        # Kampanya güncelle
DELETE /api/campaigns/:id        # Kampanya sil

POST   /api/campaigns/:id/preview   # Ön izleme
POST   /api/campaigns/:id/send      # Gönderimi başlat
GET    /api/campaigns/:id/report    # Rapor
POST   /api/campaigns/:id/pause     # Duraklat
POST   /api/campaigns/:id/resume    # Devam ettir
```

## 🎓 Demo Senaryosu

### Senaryo: Yeni Ürün Tanıtımı

1. **Hazırlık:**
   - 50 müşteri kişisi database'e ekle
   - Her kişi için `consent = true` olarak ayarla

2. **Kampanya:**
   ```
   Kampanya Adı: Yeni Ürün Tanıtımı
   Kanal: WhatsApp Web
   Mesaj:
   Merhaba {name},
   
   {company} olarak yeni ürünümüzü tanıtmak istiyoruz...
   
   Hedef: 50 kişi
   Hız: Düşük (önerilen)
   ```

3. **Gönderim:**
   - Ön izleme kontrol et
   - Uyum kontrollerini geç
   - Onay ver ve başlat

4. **Sonuç:**
   - ~2-3 dakika içinde 50 mesaj gönderilir
   - Raporda başarı oranını gör
   - Başarısız olanlar için hata nedenlerini incele

## 📞 Destek

Sorunlarınız için:
1. Browser console loglarını kontrol edin
2. `pino` loglarını inceleyin
3. Supabase logs'a bakın
4. GitHub Issues'a konu açın

## 📝 Changelog

### v2.0.0 - WhatsApp Web/Desktop Kanalı
- ✅ whatsapp-web.js entegrasyonu
- ✅ QR ile oturum açma
- ✅ Kişi ve grup listeleme
- ✅ Kampanya yönetimi
- ✅ Ön izleme sistemi
- ✅ Ban risk kontrolleri
- ✅ Blacklist yönetimi
- ✅ Detaylı raporlama

---

**Not:** Bu sistem eğitim ve küçük ölçekli kullanım içindir. Production ortamında kullanmadan önce yasal düzenlemeleri kontrol edin ve WhatsApp Kullanım Şartlarını okuyun.

