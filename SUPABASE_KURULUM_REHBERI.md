# 🚀 Kendi Serverınızdaki Supabase'e Kurulum Rehberi

## 📋 Gereksinimler
- ✅ Kendi serverınızda kurulu Supabase instance
- ✅ Supabase Dashboard erişimi
- ✅ Database admin yetkisi

---

## 🎯 ADIM 1: Supabase Dashboard'a Giriş

1. Kendi Supabase instance'ınızın URL'sine gidin
   ```
   Örnek: https://your-supabase-domain.com
   ```

2. Admin hesabınızla giriş yapın

3. Yeni proje oluşturun veya mevcut projeyi seçin

---

## 🗄️ ADIM 2: Database Kurulumu

### 2.1. SQL Editor'ı Açın
1. Sol menüden **SQL Editor** sekmesine tıklayın
2. **New Query** butonuna basın

### 2.2. Komple SQL'i Çalıştırın
1. `FULL_DATABASE_SETUP.sql` dosyasını açın
2. **Tüm içeriği kopyalayın**
3. SQL Editor'a yapıştırın
4. **RUN** butonuna basın (veya Ctrl+Enter)

### 2.3. Sonucu Kontrol Edin
Başarılı olursa şu mesajı görmelisiniz:
```
✅ Database kurulumu başarıyla tamamlandı!
Şimdi Supabase Dashboard > Storage > New Bucket ile "whatsapp-media" bucket'ı oluşturun
```

---

## 📦 ADIM 3: Storage Bucket Oluşturma

### 3.1. Storage Bölümüne Git
1. Sol menüden **Storage** sekmesine tıklayın
2. **New Bucket** butonuna basın

### 3.2. Bucket Ayarları
```
Bucket Name: whatsapp-media
Public bucket: ✅ (İşaretli)
File size limit: 50MB
Allowed MIME types: Boş bırakın (tüm dosya tipleri)
```

3. **Create bucket** butonuna tıklayın

### 3.3. Bucket Politikalarını Kontrol Edin
1. `whatsapp-media` bucket'ına tıklayın
2. **Policies** sekmesine gidin
3. Şu 3 politika görünmeli:
   - ✅ Public Access (SELECT)
   - ✅ Authenticated users can upload (INSERT)
   - ✅ Authenticated users can delete (DELETE)

**Not:** Eğer politikalar yoksa, `FULL_DATABASE_SETUP.sql` dosyasının en altındaki Storage politikalarını tekrar çalıştırın.

---

## 🔑 ADIM 4: API Anahtarlarını Alma

### 4.1. Settings'e Git
1. Sol menüden **Settings** > **API** sekmesine gidin

### 4.2. Gerekli Bilgileri Kopyalayın
```
✅ Project URL
✅ anon/public key (API Key)
```

### 4.3. Environment Variables Oluştur
Projenizin ana dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local dosyası
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
YONCU_API_BASE_URL=https://www.yoncu.com
```

**ÖNEMLİ:** 
- `your-supabase-url.com` yerine kendi Supabase URL'inizi yazın
- `your-anon-key-here` yerine kopyaladığınız anon key'i yapıştırın

---

## ✅ ADIM 5: Kurulumu Test Etme

### 5.1. Tabloları Kontrol Edin
1. Dashboard'da **Table Editor** sekmesine gidin
2. Şu tabloların oluştuğunu kontrol edin:
   - ✅ users
   - ✅ contacts
   - ✅ templates
   - ✅ template_media
   - ✅ settings
   - ✅ groups
   - ✅ group_contacts
   - ✅ wa_web_sessions
   - ✅ campaigns
   - ✅ send_jobs
   - ✅ blacklist
   - ✅ message_history

### 5.2. İlk Verileri Kontrol Edin
1. **users** tablosunu açın
   - ✅ 1 kayıt olmalı (admin kullanıcısı)
   
2. **settings** tablosunu açın
   - ✅ 1 kayıt olmalı (boş settings)
   
3. **wa_web_sessions** tablosunu açın
   - ✅ 1 kayıt olmalı (default session)

### 5.3. Uygulamayı Çalıştırın
```bash
# Bağımlılıkları yükle (ilk kez)
npm install

# Development modda çalıştır
npm run dev
```

### 5.4. Login Test
1. Tarayıcıda açın: http://localhost:3000/login
2. Giriş yapın:
   ```
   Kullanıcı Adı: admin
   Şifre: admin123
   ```
3. ✅ Dashboard'a yönlendirilmelisiniz

---

## 🔒 ADIM 6: Güvenlik Ayarları (ÖNEMLİ!)

### 6.1. Admin Şifresini Değiştirin
```sql
-- SQL Editor'da çalıştırın
UPDATE users 
SET password = 'yeni-guclu-sifreniz' 
WHERE username = 'admin';
```

**ÖNEMLİ:** Production'da mutlaka bcrypt ile hash'lenmiş şifre kullanın!

### 6.2. RLS Politikalarını Gözden Geçirin
Şu an tüm tablolarda `USING (true)` politikası var (herkes erişebilir).

**Production için:**
1. Authentication sistemi ekleyin
2. RLS politikalarını kullanıcı bazlı yapın
3. API rate limiting ekleyin

### 6.3. CORS Ayarları
1. **Settings** > **API** > **CORS Settings**
2. Allowed origins'a domain'inizi ekleyin:
   ```
   http://localhost:3000 (development için)
   https://your-domain.com (production için)
   ```

---

## 🎯 ADIM 7: Docker Deployment için Environment Variables

Eğer Docker ile deploy edecekseniz, `.env` dosyası oluşturun:

```bash
# .env dosyası (Docker için)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
YONCU_API_BASE_URL=https://www.yoncu.com
NODE_ENV=production
```

---

## 🐛 Sorun Giderme

### ❌ "relation does not exist" Hatası
**Çözüm:** SQL dosyasını tekrar çalıştırın. Tüm tabloların oluştuğunu kontrol edin.

### ❌ "Bucket not found" Hatası
**Çözüm:** 
1. Storage > Buckets'ı kontrol edin
2. `whatsapp-media` bucket'ının olduğunu doğrulayın
3. Bucket adının tam olarak `whatsapp-media` olduğundan emin olun

### ❌ "Permission denied" Hatası
**Çözüm:**
1. RLS politikalarını kontrol edin
2. Storage politikalarının doğru kurulduğunu onaylayın
3. SQL Editor'da politika komutlarını tekrar çalıştırın

### ❌ Connection Error
**Çözüm:**
1. `.env.local` dosyasının doğru konumda olduğunu kontrol edin
2. Supabase URL ve Key'in doğru olduğunu onaylayın
3. Uygulamayı yeniden başlatın: `npm run dev`

### ❌ Login Çalışmıyor
**Çözüm:**
1. `users` tablosunda admin kullanıcısının olduğunu kontrol edin
2. Şifrenin `admin123` olduğunu doğrulayın
3. Browser console'da hata mesajlarını kontrol edin

---

## 📊 Veri Yedekleme (Önerilen)

### Manuel Backup
1. **Settings** > **Database** > **Backups**
2. **Create Backup** butonuna tıklayın

### Otomatik Backup (Supabase Pro)
1. **Settings** > **Database** > **Backups**
2. **Schedule Backups** bölümünden ayarlayın

### SQL Export
```bash
# Tüm database'i export et
pg_dump -h your-supabase-db-host -U postgres -d postgres > backup.sql
```

---

## 🎉 Kurulum Tamamlandı!

Artık uygulamanız tamamen hazır. Şimdi yapabilecekleriniz:

✅ **Kişiler** - CSV import ile toplu kişi ekleyin
✅ **Şablonlar** - Mesaj şablonları oluşturun
✅ **Gruplar** - Kişi grupları düzenleyin
✅ **WhatsApp Web** - QR kod ile bağlanın
✅ **Kampanyalar** - Toplu mesaj gönderin
✅ **Raporlar** - Gönderim istatistiklerini görün

---

## 📞 Destek

Sorun yaşarsanız:
1. Bu README'deki sorun giderme bölümünü kontrol edin
2. Supabase logs'larını inceleyin (Dashboard > Logs)
3. Browser console'da hata mesajlarını kontrol edin

---

## 🔄 Sonraki Adımlar

1. **Yöncu API Ayarları** → Dashboard > Ayarlar'dan Service ID ve Auth Token girin
2. **WhatsApp Web Bağlantısı** → Dashboard > WhatsApp Web Session'dan QR kod ile bağlanın
3. **İlk Kampanya** → Dashboard > Kampanyalar'dan test kampanyası oluşturun
4. **Production Deploy** → Docker veya Vercel ile deploy edin

---

**Başarılar! 🚀**
