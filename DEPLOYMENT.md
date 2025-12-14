# Deployment Kılavuzu

## Vercel'e Deploy Etme

### 1. Vercel Hesabı Oluşturma

1. [Vercel](https://vercel.com) adresine gidin ve GitHub hesabınızla giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin

### 2. Environment Variables Ekleme

Vercel dashboard'da projenizin ayarlarına gidin ve aşağıdaki environment variables'ı ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
YONCU_API_BASE_URL=https://www.yoncu.com
```

### 3. Build Settings

Vercel otomatik olarak Next.js projenizi algılayacak ve doğru build komutlarını kullanacaktır:

- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 4. Deploy

1. "Deploy" butonuna tıklayın
2. Build tamamlanana kadar bekleyin (yaklaşık 2-3 dakika)
3. Deploy tamamlandığında size bir URL verilecek

### 5. Custom Domain (Opsiyonel)

1. Vercel dashboard'da "Domains" sekmesine gidin
2. "Add Domain" butonuna tıklayın
3. Domain adınızı girin ve DNS kayıtlarını ekleyin

## Netlify'a Deploy Etme

### 1. Netlify Hesabı

1. [Netlify](https://netlify.com) adresine gidin
2. GitHub hesabınızla giriş yapın

### 2. Site Oluşturma

1. "New site from Git" butonuna tıklayın
2. GitHub repository'nizi seçin
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

### 3. Environment Variables

Settings > Build & deploy > Environment bölümüne gidin ve ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
YONCU_API_BASE_URL
```

## Docker ile Deploy

### Dockerfile Oluşturma

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - YONCU_API_BASE_URL=https://www.yoncu.com
    restart: unless-stopped
```

### Çalıştırma

```bash
docker-compose up -d
```

## Production Checklist

- [ ] Supabase database kurulumu tamamlandı
- [ ] Environment variables eklendi
- [ ] API ayarları yapılandırıldı
- [ ] İlk kullanıcı oluşturuldu
- [ ] Servis bağlantısı test edildi
- [ ] Responsive tasarım kontrol edildi
- [ ] Dark/Light mode test edildi
- [ ] Tüm modüller çalışıyor
- [ ] Hata yönetimi test edildi
- [ ] Performance optimizasyonu yapıldı

## Monitoring ve Bakım

### Önerilen Araçlar

1. **Vercel Analytics** - Sayfa performansı
2. **Sentry** - Hata takibi
3. **LogRocket** - Kullanıcı oturumu kayıtları
4. **Supabase Dashboard** - Database monitoring

### Backup Stratejisi

1. Supabase automatic backups'ı etkinleştirin
2. Düzenli database export'ları yapın
3. Environment variables'ı güvenli bir yerde saklayın

## Güvenlik Önerileri

1. **RLS Etkinleştirin:** Supabase Row Level Security politikaları ekleyin
2. **HTTPS Kullanın:** Tüm production ortamlarında SSL zorunlu olmalı
3. **Rate Limiting:** API endpoint'lerine rate limiting ekleyin
4. **Şifreleme:** Kullanıcı şifrelerini hash'leyin (bcrypt)
5. **CORS:** Sadece kendi domain'inizden gelen isteklere izin verin

## Performans Optimizasyonu

1. **Image Optimization:** Next.js Image component kullanın
2. **Caching:** API response'larını cache'leyin
3. **Code Splitting:** Dynamic import'ları kullanın
4. **Database Indexes:** Sık kullanılan sorgular için index ekleyin
5. **CDN:** Static dosyalar için CDN kullanın

## Sorun Giderme

### Build Hatası

```bash
# Cache'i temizle
rm -rf .next
npm ci
npm run build
```

### Environment Variables Hatası

- Vercel dashboard'da variables'ın doğru girildiğini kontrol edin
- Redeploy yapın (variables değişikliği için gerekli)

### Database Bağlantı Hatası

- Supabase URL ve Key'in doğru olduğunu kontrol edin
- Supabase projesinin aktif olduğunu onaylayın
- IP whitelist ayarlarını kontrol edin (eğer varsa)

## Destek

Sorun yaşarsanız:
1. GitHub Issues'da sorun bildirin
2. Logs'ları kontrol edin (Vercel/Netlify dashboard)
3. Supabase logs'larını inceleyin

