# 🚀 Coolify Deployment Rehberi - WhatsApp Yönetim Paneli

## 📋 Ön Gereksinimler

- ✅ Coolify kurulu server
- ✅ GitHub/GitLab repository
- ✅ Supabase kurulumu tamamlanmış
- ✅ Domain adı (opsiyonel ama önerilen)

---

## 🎯 ADIM 1: Repository'yi Hazırlama

### 1.1. Git Kontrolü
```bash
cd /Users/hikmettanriverdi/whatsapp-api-new
git status
```

### 1.2. Değişiklikleri Commit Edin
```bash
# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "feat: Production deployment için Coolify hazırlığı

- Supabase database kurulumu tamamlandı
- Docker ve docker-compose yapılandırıldı
- WhatsApp Web desteği eklendi
- Environment variables hazırlandı
"

# GitHub'a push
git push origin main
```

### 1.3. Repository URL'ini Alın
```
https://github.com/hiktan44/whatsapp-new-wtih-web.git
```

---

## 🐳 ADIM 2: Coolify'da Yeni Proje Oluşturma

### 2.1. Coolify Dashboard'a Giriş
```
Coolify server URL'inize gidin
Örnek: https://coolify.yourdomain.com
```

### 2.2. New Resource > Application
1. **"New Resource"** butonuna tıklayın
2. **"Application"** seçin
3. **"Public Repository"** seçin (veya Private ise GitHub entegrasyonu yapın)

### 2.3. Repository Bilgileri
```
Repository URL: https://github.com/hiktan44/whatsapp-new-wtih-web.git
Branch: main
```

---

## ⚙️ ADIM 3: Build & Deploy Ayarları

### 3.1. Build Pack Seçimi
```
Build Pack: Dockerfile
```

### 3.2. Dockerfile Yolu
```
Dockerfile Path: ./Dockerfile
```

### 3.3. Port Ayarları
```
Port: 3000
```

### 3.4. Health Check (Opsiyonel)
```
Health Check Path: /api/health
Health Check Port: 3000
```

---

## 🔐 ADIM 4: Environment Variables

Coolify'da **Environment Variables** bölümüne gidin ve şunları ekleyin:

### 4.1. Supabase Variables (ZORUNLU)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 4.2. Yöncu API Variables
```env
YONCU_API_BASE_URL=https://www.yoncu.com
```

### 4.3. Node Environment
```env
NODE_ENV=production
```

### 4.4. Puppeteer Variables (WhatsApp Web için)
```env
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WA_WEB_HEADLESS=1
```

### 4.5. Next.js Variables
```env
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
```

---

## 💾 ADIM 5: Persistent Storage (WhatsApp Sessions)

### 5.1. Volumes Ekleme
Coolify'da **Storages** bölümüne gidin:

**Volume 1: WhatsApp Auth**
```
Name: wa-web-sessions
Mount Path: /app/.wwebjs_auth
```

**Volume 2: WhatsApp Cache**
```
Name: wa-web-cache
Mount Path: /app/.wwebjs_cache
```

### 5.2. Neden Gerekli?
- WhatsApp Web session'ları kalıcı olur
- Container yeniden başlatıldığında QR kod tekrar taratılmaz
- Bağlantı bilgileri korunur

---

## 🌐 ADIM 6: Domain Ayarları

### 6.1. Domain Ekleme
1. **Domains** sekmesine gidin
2. **Add Domain** butonuna tıklayın
3. Domain adınızı girin:
   ```
   Örnek: whatsapp.yourdomain.com
   ```

### 6.2. SSL Sertifikası
- ✅ Coolify otomatik Let's Encrypt sertifikası oluşturur
- ✅ HTTPS otomatik aktif olur

### 6.3. DNS Ayarları
Domain sağlayıcınızda A kaydı ekleyin:
```
Type: A
Name: whatsapp (veya subdomain)
Value: [Coolify Server IP]
TTL: 300
```

---

## 🚀 ADIM 7: Build & Deploy

### 7.1. Deploy Başlat
1. **Deploy** butonuna tıklayın
2. Build loglarını izleyin
3. Yaklaşık 5-10 dakika sürer

### 7.2. Build Aşamaları
```
✓ Cloning repository
✓ Installing dependencies (npm ci)
✓ Building Next.js application
✓ Installing Chromium for Puppeteer
✓ Creating Docker image
✓ Starting container
✓ Health check passed
```

### 7.3. Deploy Başarılı!
```
✅ Application is running
✅ Available at: https://whatsapp.yourdomain.com
```

---

## ✅ ADIM 8: İlk Test

### 8.1. Uygulamayı Açın
```
https://whatsapp.yourdomain.com/login
```

### 8.2. Login Yapın
```
Kullanıcı: admin
Şifre: admin123
```

### 8.3. WhatsApp Web Testi
1. Dashboard > WhatsApp Web Session
2. "Bağlan" butonuna tıklayın
3. QR kod görünmeli
4. Telefonunuzla tarayın
5. Bağlantı kurulmalı ✅

---

## 📊 ADIM 9: Monitoring & Logs

### 9.1. Logs İzleme
Coolify'da **Logs** sekmesine gidin:
```
Real-time application logs
Container logs
Build logs
```

### 9.2. Metrics
```
CPU Usage
Memory Usage
Network Traffic
```

### 9.3. Restart/Stop
```
Restart: Container'ı yeniden başlat
Stop: Uygulamayı durdur
Rebuild: Yeniden build et
```

---

## 🔄 ADIM 10: Otomatik Deployment (CI/CD)

### 10.1. Webhook Aktif Et
Coolify'da **Webhooks** bölümüne gidin:
```
✅ Enable automatic deployments on push
```

### 10.2. GitHub Webhook Ekle
1. GitHub repository > Settings > Webhooks
2. **Add webhook** butonuna tıklayın
3. Coolify webhook URL'ini yapıştırın
4. Events: **Just the push event**
5. **Add webhook**

### 10.3. Artık Otomatik!
```
git push origin main
↓
GitHub webhook tetiklenir
↓
Coolify otomatik build yapar
↓
Yeni versiyon deploy edilir
```

---

## 🐛 Sorun Giderme

### ❌ Build Hatası: "npm ci failed"
**Çözüm:**
- `package-lock.json` dosyasının commit edildiğinden emin olun
- Node.js versiyonunu kontrol edin (20.x olmalı)

### ❌ "Chromium not found" Hatası
**Çözüm:**
- Dockerfile'da Chromium kurulumu var mı kontrol edin
- Environment variables doğru mu?
```env
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### ❌ "Supabase connection failed"
**Çözüm:**
- Environment variables'ı kontrol edin
- Supabase URL ve Key doğru mu?
- Supabase'de IP whitelist var mı? (Coolify server IP'sini ekleyin)

### ❌ WhatsApp Session Kayboldu
**Çözüm:**
- Persistent volumes eklenmiş mi kontrol edin
- Volume mount path'leri doğru mu?
```
/app/.wwebjs_auth
/app/.wwebjs_cache
```

### ❌ Port Already in Use
**Çözüm:**
- Coolify'da farklı bir port kullanın
- Veya mevcut container'ı durdurun

---

## 🔒 Güvenlik Önerileri

### 1. Admin Şifresini Değiştirin
```sql
-- Supabase SQL Editor'da
UPDATE users 
SET password = 'guclu-yeni-sifreniz' 
WHERE username = 'admin';
```

### 2. Firewall Ayarları
```bash
# Sadece Coolify'dan gelen trafiğe izin ver
# Supabase'de IP whitelist kullanın
```

### 3. Environment Variables
```
✅ Hiçbir zaman git'e commit etmeyin
✅ Sadece Coolify'da saklayın
✅ Düzenli olarak rotate edin
```

### 4. HTTPS Zorunlu
```
✅ Coolify otomatik SSL sağlar
✅ HTTP'den HTTPS'e yönlendirme aktif
```

### 5. Rate Limiting
```
✅ Nginx reverse proxy kullanın
✅ API endpoint'lerine rate limit ekleyin
```

---

## 📈 Performans Optimizasyonu

### 1. Resource Limits
Coolify'da container resource limitlerini ayarlayın:
```
CPU: 1-2 cores
Memory: 1-2 GB
```

### 2. Caching
```
✅ Next.js automatic caching aktif
✅ Static assets CDN'de
```

### 3. Database Connection Pooling
```
✅ Supabase otomatik connection pooling
```

---

## 🔄 Backup Stratejisi

### 1. Database Backup
```
✅ Supabase otomatik backup
✅ Manuel export düzenli yapın
```

### 2. WhatsApp Sessions Backup
```bash
# Coolify'da volume backup
# Veya manuel olarak:
docker cp container_name:/app/.wwebjs_auth ./backup/
```

### 3. Environment Variables Backup
```
✅ Güvenli bir yerde saklayın (1Password, Bitwarden)
```

---

## 📱 Mobil Uygulama (Bonus)

Coolify ile PWA olarak kullanılabilir:
```
✅ HTTPS aktif
✅ manifest.json var
✅ Service worker eklenebilir
✅ Mobil cihazlarda "Ana Ekrana Ekle"
```

---

## 🎉 Deployment Tamamlandı!

### Erişim Bilgileri:
```
🌐 URL: https://whatsapp.yourdomain.com
👤 Kullanıcı: admin
🔑 Şifre: admin123 (değiştirin!)
```

### Özellikler:
- ✅ WhatsApp Web tam çalışıyor
- ✅ QR kod bağlantısı aktif
- ✅ Session'lar kalıcı
- ✅ Otomatik deployment
- ✅ SSL sertifikası
- ✅ Health check
- ✅ Monitoring

---

## 📞 Destek

Sorun yaşarsanız:
1. Coolify logs'larını kontrol edin
2. Browser console'u inceleyin (F12)
3. Supabase logs'larını kontrol edin
4. GitHub Issues'da sorun bildirin

---

## 🔄 Güncelleme

Yeni versiyon deploy etmek için:
```bash
git add .
git commit -m "feat: yeni özellik"
git push origin main
```

Coolify otomatik olarak yeni versiyonu deploy edecek! 🚀

---

**Başarılar! 🎉**
