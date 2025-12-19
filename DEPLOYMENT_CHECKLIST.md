# ✅ Deployment Checklist - WhatsApp Yönetim Paneli

## 📋 Ön Hazırlık (5 dakika)

- [ ] Kendi Supabase instance'ınıza giriş yaptınız mı?
- [ ] Yeni proje oluşturdunuz mu? (veya mevcut projeyi seçtiniz mi?)
- [ ] SQL Editor'a erişiminiz var mı?

---

## 🗄️ Database Kurulumu (10 dakika)

### Adım 1: SQL Dosyasını Çalıştırın
- [ ] `FULL_DATABASE_SETUP.sql` dosyasını açtınız mı?
- [ ] SQL Editor'a kopyaladınız mı?
- [ ] RUN butonuna bastınız mı?
- [ ] "✅ Database kurulumu başarıyla tamamlandı!" mesajını gördünüz mü?

### Adım 2: Tabloları Kontrol Edin
- [ ] **users** tablosu oluştu mu? (1 kayıt: admin)
- [ ] **contacts** tablosu oluştu mu?
- [ ] **templates** tablosu oluştu mu?
- [ ] **template_media** tablosu oluştu mu?
- [ ] **settings** tablosu oluştu mu? (1 kayıt: boş settings)
- [ ] **groups** tablosu oluştu mu?
- [ ] **group_contacts** tablosu oluştu mu?
- [ ] **wa_web_sessions** tablosu oluştu mu? (1 kayıt: default)
- [ ] **campaigns** tablosu oluştu mu?
- [ ] **send_jobs** tablosu oluştu mu?
- [ ] **blacklist** tablosu oluştu mu?
- [ ] **message_history** tablosu oluştu mu?

---

## 📦 Storage Kurulumu (5 dakika)

### Adım 3: Bucket Oluşturun
- [ ] Storage sekmesine gittiniz mi?
- [ ] "New Bucket" butonuna bastınız mı?
- [ ] Bucket adı: `whatsapp-media` olarak girdiniz mi?
- [ ] "Public bucket" işaretli mi? ✅
- [ ] "Create bucket" butonuna bastınız mı?

### Adım 4: Politikaları Kontrol Edin
- [ ] Bucket'a tıkladınız mı?
- [ ] "Policies" sekmesine gittiniz mi?
- [ ] 3 politika görünüyor mu?
  - [ ] Public Access (SELECT)
  - [ ] Authenticated users can upload (INSERT)
  - [ ] Authenticated users can delete (DELETE)

---

## 🔑 API Anahtarları (3 dakika)

### Adım 5: Anahtarları Alın
- [ ] Settings > API sekmesine gittiniz mi?
- [ ] **Project URL** kopyaladınız mı?
- [ ] **anon/public key** kopyaladınız mı?

### Adım 6: Environment Variables
- [ ] Proje dizininde `.env.local` dosyası oluşturdunuz mu?
- [ ] `NEXT_PUBLIC_SUPABASE_URL` eklediniz mi?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklediniz mi?
- [ ] `YONCU_API_BASE_URL=https://www.yoncu.com` eklediniz mi?

**Örnek `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
YONCU_API_BASE_URL=https://www.yoncu.com
```

---

## 🚀 Uygulama Kurulumu (5 dakika)

### Adım 7: Bağımlılıkları Yükleyin
```bash
npm install
```
- [ ] Bağımlılıklar yüklendi mi?
- [ ] Hata mesajı var mı?

### Adım 8: Uygulamayı Çalıştırın
```bash
npm run dev
```
- [ ] Uygulama başladı mı?
- [ ] http://localhost:3000 açıldı mı?

---

## ✅ Test (5 dakika)

### Adım 9: Login Testi
- [ ] http://localhost:3000/login adresine gittiniz mi?
- [ ] Kullanıcı adı: `admin` girdiniz mi?
- [ ] Şifre: `admin123` girdiniz mi?
- [ ] Dashboard'a yönlendirildiniz mi? ✅

### Adım 10: Sayfa Testleri
- [ ] **Dashboard** sayfası açılıyor mu?
- [ ] **Kişiler** sayfası açılıyor mu?
- [ ] **Şablonlar** sayfası açılıyor mu?
- [ ] **Gruplar** sayfası açılıyor mu?
- [ ] **Mesaj Gönder** sayfası açılıyor mu?
- [ ] **WhatsApp Web Session** sayfası açılıyor mu?
- [ ] **Kampanyalar** sayfası açılıyor mu?
- [ ] **Geçmiş** sayfası açılıyor mu?
- [ ] **Ayarlar** sayfası açılıyor mu?

### Adım 11: Fonksiyon Testleri
- [ ] Yeni kişi ekleyebildiniz mi?
- [ ] Yeni şablon oluşturabildiniz mi?
- [ ] Şablona görsel yükleyebildiniz mi?
- [ ] Yeni grup oluşturabildiniz mi?

---

## 🔒 Güvenlik (5 dakika)

### Adım 12: Admin Şifresini Değiştirin
```sql
UPDATE users 
SET password = 'yeni-guclu-sifreniz' 
WHERE username = 'admin';
```
- [ ] SQL Editor'da çalıştırdınız mı?
- [ ] Yeni şifre ile giriş yapabildiniz mi?

### Adım 13: CORS Ayarları
- [ ] Settings > API > CORS Settings'e gittiniz mi?
- [ ] `http://localhost:3000` eklediniz mi?
- [ ] Production domain'inizi eklediniz mi?

---

## 🐳 Docker Deployment (Opsiyonel)

### Adım 14: Docker için Hazırlık
- [ ] `.env` dosyası oluşturdunuz mu? (`.env.local`'dan farklı!)
- [ ] Environment variables'ları `.env`'ye kopyaladınız mı?
- [ ] `docker-compose.yml` dosyası var mı?

### Adım 15: Docker Build
```bash
docker-compose up -d --build
```
- [ ] Build başarılı mı?
- [ ] Container çalışıyor mu?
- [ ] http://localhost:3001 açılıyor mu?

---

## 🌐 Production Deployment

### Seçenek A: Vercel (Önerilen - Kolay)
- [ ] GitHub'a push yaptınız mı?
- [ ] Vercel'e giriş yaptınız mı?
- [ ] "New Project" oluşturdunuz mu?
- [ ] Repository'yi seçtiniz mi?
- [ ] Environment variables eklediniz mi?
- [ ] Deploy başarılı mı?

### Seçenek B: VPS + Docker (Tam Özellikli)
- [ ] VPS satın aldınız mı? (DigitalOcean, Hetzner, vb.)
- [ ] SSH ile bağlandınız mı?
- [ ] Docker kuruldu mu?
- [ ] Repository'yi clone'ladınız mı?
- [ ] `.env` dosyasını oluşturdunuz mu?
- [ ] `docker-compose up -d` çalıştırdınız mı?
- [ ] Nginx reverse proxy kurdunuz mu?
- [ ] SSL sertifikası eklediniz mi? (Let's Encrypt)

---

## 📊 Monitoring (Opsiyonel)

### Adım 16: Log Kontrolü
- [ ] Supabase Dashboard > Logs kontrol ettiniz mi?
- [ ] Uygulama loglarını kontrol ettiniz mi?
- [ ] Hata var mı?

### Adım 17: Backup Ayarları
- [ ] Supabase automatic backup etkinleştirdiniz mi?
- [ ] Backup schedule ayarladınız mı?

---

## 🎉 Final Kontrol

### Tüm Özellikler Çalışıyor mu?
- [ ] ✅ Login/Logout
- [ ] ✅ Kişi ekleme/düzenleme/silme
- [ ] ✅ CSV import
- [ ] ✅ Şablon oluşturma
- [ ] ✅ Medya yükleme
- [ ] ✅ Grup yönetimi
- [ ] ✅ Mesaj gönderme (Yöncu API)
- [ ] ✅ WhatsApp Web bağlantısı
- [ ] ✅ QR kod gösterimi
- [ ] ✅ Kampanya oluşturma
- [ ] ✅ Mesaj geçmişi
- [ ] ✅ Raporlar
- [ ] ✅ Dark/Light mode
- [ ] ✅ Responsive tasarım (mobil test)

---

## 📝 Dokümantasyon

### Kullanıcı Kılavuzu
- [ ] README.md güncel mi?
- [ ] QUICK_START.md okunaklı mı?
- [ ] WA_WEB_SETUP.md açık mı?

---

## 🚨 Sorun Giderme

### Yaygın Hatalar

**❌ "relation does not exist"**
- [ ] SQL dosyasını tekrar çalıştırdınız mı?

**❌ "Bucket not found"**
- [ ] Bucket adı tam olarak `whatsapp-media` mi?
- [ ] Bucket public olarak işaretli mi?

**❌ "Permission denied"**
- [ ] RLS politikaları kuruldu mu?
- [ ] Storage politikaları çalıştırıldı mı?

**❌ "Connection Error"**
- [ ] `.env.local` doğru konumda mı?
- [ ] Supabase URL doğru mu?
- [ ] Anon key doğru mu?
- [ ] Uygulamayı yeniden başlattınız mı?

---

## 🎯 Sonraki Adımlar

### Hemen Yapılacaklar
1. [ ] Yöncu API ayarlarını girin (Dashboard > Ayarlar)
2. [ ] WhatsApp Web'e bağlanın (QR kod ile)
3. [ ] Test kişileri ekleyin
4. [ ] Test şablonları oluşturun
5. [ ] İlk test mesajı gönderin

### İlerisi İçin
1. [ ] Production şifrelerini güçlendirin
2. [ ] 2FA ekleyin
3. [ ] Rate limiting yapılandırın
4. [ ] Monitoring araçları kurun (Sentry, LogRocket)
5. [ ] Backup stratejisi belirleyin

---

## ✅ DEPLOYMENT TAMAMLANDI!

**Tebrikler! 🎉** Uygulamanız artık canlı ve kullanıma hazır.

### Hızlı Erişim Linkleri
- 🏠 Dashboard: http://localhost:3000/dashboard
- 👤 Login: http://localhost:3000/login
- 📱 WhatsApp Web: http://localhost:3000/dashboard/wa-web-session
- 📊 Kampanyalar: http://localhost:3000/dashboard/campaigns

### Önemli Bilgiler
- 👤 Varsayılan Kullanıcı: `admin`
- 🔑 Varsayılan Şifre: `admin123` (değiştirin!)
- 📦 Storage Bucket: `whatsapp-media`
- 🔗 API Base: `https://www.yoncu.com`

---

**Başarılar! 🚀**
