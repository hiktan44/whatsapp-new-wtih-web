# ⚡ Coolify Hızlı Başlangıç - 15 Dakikada Deploy!

## 📋 Hızlı Checklist

### ✅ 1. Repository'yi Push Edin (2 dakika)
```bash
cd /Users/hikmettanriverdi/whatsapp-api-new

# Tüm değişiklikleri ekle
git add .

# Commit
git commit -m "feat: Coolify deployment hazır"

# Push
git push origin main
```

---

### ✅ 2. Coolify'da Yeni Uygulama (3 dakika)

**Coolify Dashboard:**
1. **New Resource** > **Application**
2. **Public Repository**
3. Repository URL: `https://github.com/hiktan44/whatsapp-new-wtih-web.git`
4. Branch: `main`
5. Build Pack: **Dockerfile**
6. Port: **3000**

---

### ✅ 3. Environment Variables Ekle (5 dakika)

**Coolify > Environment Variables:**

```env
# Supabase (ZORUNLU - Kendi değerlerinizi girin!)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Yöncu API
YONCU_API_BASE_URL=https://www.yoncu.com

# Node
NODE_ENV=production

# Puppeteer (WhatsApp Web için)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WA_WEB_HEADLESS=1

# Next.js
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
```

**ÖNEMLİ:** `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini kendi Supabase bilgilerinizle değiştirin!

---

### ✅ 4. Persistent Storage Ekle (2 dakika)

**Coolify > Storages > Add Volume:**

**Volume 1:**
```
Name: wa-web-sessions
Mount Path: /app/.wwebjs_auth
```

**Volume 2:**
```
Name: wa-web-cache
Mount Path: /app/.wwebjs_cache
```

---

### ✅ 5. Domain Ekle (Opsiyonel - 3 dakika)

**Coolify > Domains:**
```
Domain: whatsapp.yourdomain.com
```

**DNS Ayarı (Domain sağlayıcınızda):**
```
Type: A
Name: whatsapp
Value: [Coolify Server IP]
```

---

### ✅ 6. Deploy! (5-10 dakika)

**Coolify'da:**
1. **Deploy** butonuna tıklayın
2. Build loglarını izleyin
3. Bekleyin... ☕

**Build tamamlandığında:**
```
✅ Application is running!
```

---

### ✅ 7. Test Edin! (2 dakika)

**Tarayıcıda açın:**
```
https://whatsapp.yourdomain.com/login
```
veya
```
http://[coolify-server-ip]:3000/login
```

**Login:**
```
Kullanıcı: admin
Şifre: admin123
```

**WhatsApp Web Test:**
1. Dashboard > WhatsApp Web Session
2. "Bağlan" butonuna tıklayın
3. QR kod tarayın
4. ✅ Bağlantı kuruldu!

---

## 🚀 Toplam Süre: ~15-20 Dakika

---

## 📝 Önemli Notlar

### ⚠️ İlk Deploy'dan Sonra:

1. **Admin şifresini değiştirin:**
   ```sql
   -- Supabase SQL Editor'da
   UPDATE users SET password = 'yeni-guclu-sifre' WHERE username = 'admin';
   ```

2. **Yöncu API ayarlarını yapın:**
   - Dashboard > Ayarlar
   - Service ID ve Auth Token girin

3. **WhatsApp Web'e bağlanın:**
   - Dashboard > WhatsApp Web Session
   - QR kod ile bağlanın

---

## 🔄 Otomatik Deployment (Bonus)

**Coolify > Webhooks:**
```
✅ Enable automatic deployments on push
```

**Artık:**
```bash
git push origin main
```
**Yaptığınızda otomatik deploy olur!** 🎉

---

## 🐛 Hızlı Sorun Giderme

### ❌ Build Hatası
- Coolify logs'larını kontrol edin
- Environment variables doğru mu?

### ❌ Supabase Bağlantı Hatası
- `NEXT_PUBLIC_SUPABASE_URL` doğru mu?
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` doğru mu?

### ❌ QR Kod Görünmüyor
- Persistent volumes eklenmiş mi?
- Chromium kuruldu mu? (Dockerfile'da var)

---

## 📞 Yardım

Detaylı rehber için:
```
COOLIFY_DEPLOYMENT.md dosyasını okuyun
```

---

**Kolay gelsin! 🚀**
