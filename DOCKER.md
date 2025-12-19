# 🐳 Docker Deployment Rehberi

Bu rehber, WhatsApp Yöncü Panel uygulamasını Docker ile çalıştırma adımlarını içerir.

## 📋 Gereksinimler

- Docker 20.10+
- Docker Compose 2.0+
- En az 2GB RAM
- En az 5GB disk alanı

## 🚀 Hızlı Başlangıç

### 1. Environment Variables Hazırlama

`.env` dosyası oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve gerekli değerleri girin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
YONCU_API_BASE_URL=https://www.yoncu.com
```

### 2. Docker Image Build

```bash
# Docker image'ı build et
docker-compose build

# Veya tek komutla build ve run
docker-compose up -d --build
```

### 3. Container'ı Başlatma

```bash
# Arka planda çalıştır
docker-compose up -d

# Logları izle
docker-compose logs -f

# Belirli bir servisin loglarını izle
docker-compose logs -f whatsapp-panel
```

### 4. Uygulamaya Erişim

Uygulama şu adreste çalışacak:
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

## 🔧 Docker Komutları

### Container Yönetimi

```bash
# Container'ları başlat
docker-compose up -d

# Container'ları durdur
docker-compose down

# Container'ları durdur ve volume'ları sil
docker-compose down -v

# Container'ları yeniden başlat
docker-compose restart

# Container durumunu kontrol et
docker-compose ps

# Container loglarını görüntüle
docker-compose logs -f whatsapp-panel

# Container'a shell ile bağlan
docker-compose exec whatsapp-panel sh
```

### Image Yönetimi

```bash
# Image'ı yeniden build et
docker-compose build --no-cache

# Image'ı sil
docker rmi whatsapp-yoncu-panel

# Kullanılmayan image'ları temizle
docker image prune -a
```

### Volume Yönetimi

```bash
# Volume'ları listele
docker volume ls

# Volume detaylarını görüntüle
docker volume inspect whatsapp-api-new_wa-web-sessions

# Volume'ları sil
docker volume rm whatsapp-api-new_wa-web-sessions whatsapp-api-new_wa-web-cache
```

## 📁 Volume Yapısı

Docker Compose aşağıdaki volume'ları oluşturur:

- **wa-web-sessions:** WhatsApp Web oturum dosyaları (`.wwebjs_auth`)
- **wa-web-cache:** WhatsApp Web cache dosyaları (`.wwebjs_cache`)

Bu volume'lar sayesinde container yeniden başlatıldığında WhatsApp Web oturumu korunur.

## 🔍 Sorun Giderme

### Container Başlamıyor

```bash
# Logları kontrol et
docker-compose logs whatsapp-panel

# Container durumunu kontrol et
docker-compose ps

# Health check durumunu kontrol et
docker inspect whatsapp-yoncu-panel | grep -A 10 Health
```

### Build Hatası

```bash
# Cache olmadan yeniden build et
docker-compose build --no-cache

# Node modules'ı temizle ve yeniden build et
rm -rf node_modules .next
docker-compose build
```

### Port Çakışması

Eğer 3000 portu kullanılıyorsa, `docker-compose.yml` dosyasında portu değiştirin:

```yaml
ports:
  - "3001:3000"  # Host:Container
```

### Environment Variables Sorunu

```bash
# Environment variables'ı kontrol et
docker-compose exec whatsapp-panel env

# Container içinde test et
docker-compose exec whatsapp-panel sh
# Sonra: echo $NEXT_PUBLIC_SUPABASE_URL
```

### WhatsApp Web Bağlantı Sorunu

```bash
# Session dosyalarını kontrol et
docker-compose exec whatsapp-panel ls -la /app/.wwebjs_auth

# Cache'i temizle (gerekirse)
docker-compose down
docker volume rm whatsapp-api-new_wa-web-cache
docker-compose up -d
```

## 🔐 Production Deployment

### Güvenlik Önerileri

1. **Environment Variables:** Hassas bilgileri `.env` dosyasında saklayın, Git'e commit etmeyin
2. **HTTPS:** Reverse proxy (Nginx/Traefik) kullanın
3. **Firewall:** Sadece gerekli portları açın
4. **Updates:** Düzenli olarak image'ları güncelleyin

### Production Docker Compose Örneği

```yaml
version: '3.8'

services:
  whatsapp-panel:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: whatsapp-yoncu-panel
    restart: always
    ports:
      - "127.0.0.1:3000:3000"  # Sadece localhost'tan erişim
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - YONCU_API_BASE_URL=${YONCU_API_BASE_URL}
    volumes:
      - wa-web-sessions:/app/.wwebjs_auth
      - wa-web-cache:/app/.wwebjs_cache
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - whatsapp-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

volumes:
  wa-web-sessions:
    driver: local
  wa-web-cache:
    driver: local

networks:
  whatsapp-network:
    driver: bridge
```

## 📊 Monitoring

### Health Check

Health check endpoint'i otomatik olarak çalışır:

```bash
# Manuel test
curl http://localhost:3000/api/health

# Docker health check durumu
docker inspect --format='{{.State.Health.Status}}' whatsapp-yoncu-panel
```

### Log Monitoring

```bash
# Real-time loglar
docker-compose logs -f

# Son 100 satır
docker-compose logs --tail=100

# Belirli bir tarihten itibaren
docker-compose logs --since 2024-01-01T00:00:00
```

## 🔄 Güncelleme

```bash
# Kodu güncelle
git pull

# Image'ı yeniden build et
docker-compose build

# Container'ı yeniden başlat
docker-compose up -d

# Eski image'ları temizle
docker image prune -a
```

## 📝 Notlar

- **WhatsApp Web Session:** Volume'lar sayesinde oturumlar kalıcıdır
- **Performance:** İlk build biraz uzun sürebilir (Chromium indirme)
- **Memory:** Puppeteer için en az 1GB RAM önerilir
- **Disk Space:** Session ve cache dosyaları için yeterli alan bırakın

## 🆘 Yardım

Sorun yaşarsanız:

1. Logları kontrol edin: `docker-compose logs -f`
2. Health check'i test edin: `curl http://localhost:3000/api/health`
3. Container durumunu kontrol edin: `docker-compose ps`
4. GitHub Issues'da arama yapın veya yeni issue açın
