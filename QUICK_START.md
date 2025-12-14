# 🚀 Hızlı Başlangıç Kılavuzu

Bu kılavuz ile 5 dakikada projenizi çalıştırabilirsiniz!

## 📋 Ön Gereksinimler

- Node.js 18+ yüklü olmalı
- npm veya yarn package manager
- Supabase hesabı (ücretsiz)
- YoncuAPI hesabı ve credentials

## ⚡ 5 Dakikada Kurulum

### 1️⃣ Projeyi İndirin ve Bağımlılıkları Yükleyin

```bash
# Projeyi klonlayın (veya ZIP indirin)
git clone https://github.com/yourusername/whatsapp-yoncu.git
cd whatsapp-yoncu

# Bağımlılıkları yükleyin
npm install
```

### 2️⃣ Supabase Kurulumu (2 dakika)

1. **Supabase hesabı oluşturun:** https://supabase.com
2. **Yeni proje oluşturun:**
   - Project adı: WhatsApp Yoncu
   - Database şifresi: Güçlü bir şifre seçin
   - Bölge: Europe West (Frankfurt)
   
3. **Database tablolarını oluşturun:**
   - Sol menüden "SQL Editor" sekmesine gidin
   - "New query" butonuna tıklayın
   - [SUPABASE_SETUP.md](SUPABASE_SETUP.md) dosyasındaki SQL kodunu kopyalayıp yapıştırın
   - "Run" butonuna tıklayın
   
4. **API anahtarlarını kopyalayın:**
   - Settings > API sekmesine gidin
   - "Project URL" ve "anon public" key'i kopyalayın

### 3️⃣ Environment Variables Ayarlayın

Proje klasöründe `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
YONCU_API_BASE_URL=https://www.yoncu.com
```

### 4️⃣ Projeyi Çalıştırın

```bash
npm run dev
```

Tarayıcınızda **http://localhost:3000** adresini açın.

### 5️⃣ İlk Giriş

```
Kullanıcı Adı: admin
Şifre: admin123
```

## ✅ İlk Kullanım Adımları

### 1. API Ayarlarını Yapılandırın

Dashboard'a giriş yaptıktan sonra:

1. Sol menüden **Ayarlar** sekmesine gidin
2. YoncuAPI bilgilerinizi girin:
   - **Service ID:** YoncuAPI panelinizdeki servis ID
   - **Authorization Token:** Basic auth token (örnek format dahil)
3. **Kaydet** butonuna tıklayın
4. **Bağlantıyı Test Et** ile kontrol edin

### 2. İlk Kişinizi Ekleyin

1. **Kişiler** menüsüne gidin
2. **Yeni Kişi** butonuna tıklayın
3. Bilgileri doldurun:
   - Ad: Ahmet
   - Soyad: Yılmaz
   - Telefon: +905001112233 (veya sadece 5001112233)
4. **Kaydet**

### 3. İlk Mesaj Şablonunuzu Oluşturun

1. **Şablonlar** menüsüne gidin
2. **Yeni Şablon** butonuna tıklayın
3. Örnek şablon:
   ```
   Merhaba {name},
   
   Sisteme hoş geldiniz!
   ```
4. **Kaydet**

### 4. İlk Mesajınızı Gönderin

1. **Mesaj Gönder** menüsüne gidin
2. **Tekil Gönderim** seçeneğini seçin
3. Oluşturduğunuz kişiyi seçin
4. Şablonunuzu seçin (veya manuel mesaj yazın)
5. **Mesajı Gönder** butonuna tıklayın

## 🎉 Tebrikler!

Artık sistemi kullanmaya başlayabilirsiniz!

## 📚 Sonraki Adımlar

- CSV ile toplu kişi ekleyin
- Daha fazla şablon oluşturun
- Toplu mesaj gönderimi deneyin
- Mesaj geçmişini inceleyin
- Kuyruk durumunu takip edin
- Dark mode'u deneyin (sağ üstteki ay/güneş ikonu)

## 🆘 Sorun mu Yaşıyorsunuz?

### Supabase Bağlantı Hatası
```bash
# .env.local dosyasının doğru konumda olduğunu kontrol edin
ls -la .env.local

# Projeyi yeniden başlatın
npm run dev
```

### Build Hatası
```bash
# Cache'i temizleyin
rm -rf .next node_modules
npm install
npm run dev
```

### Port 3000 Kullanımda
```bash
# Farklı port kullanın
npm run dev -- -p 3001
```

## 📖 Detaylı Dokümantasyon

- [README.md](README.md) - Tam dokümantasyon
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detaylı Supabase kurulumu
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production'a deploy etme

## 🎯 İpuçları

1. **Güvenlik:** İlk girişten sonra şifrenizi değiştirin
2. **Test:** Önce bir iki test mesajı gönderin
3. **CSV:** CSV import için şablon dosyayı indirin
4. **Şablonlar:** {name} ile kişiye özel mesajlar oluşturun
5. **Kuyruk:** Kuyruk sayfası otomatik yenilenir (10 saniye)

## 💡 Bonus Özellikler

- **Dark Mode:** Header'daki tema butonunu kullanın
- **Responsive:** Mobil cihazlardan da kullanabilirsiniz
- **Search:** Tüm sayfalarda arama özelliği var
- **Toast:** Başarılı/hatalı işlemler için bildirimler
- **Animasyonlar:** Smooth transitions ve hover efektleri

---

Başarılar dileriz! 🚀

