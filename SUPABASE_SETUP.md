# Supabase Kurulum Kılavuzu

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) adresine gidin ve hesap oluşturun
2. "New Project" butonuna tıklayın
3. Proje adı, database şifresi ve bölge seçin
4. Projeniz hazır olana kadar bekleyin (yaklaşık 2 dakika)

## 2. Database Tablolarını Oluşturma

Supabase Dashboard'da "SQL Editor" sekmesine gidin ve aşağıdaki SQL kodunu çalıştırın:

```sql
-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts tablosu
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  company TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Templates tablosu
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings tablosu
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT NOT NULL,
  auth_token TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Message History tablosu
CREATE TABLE IF NOT EXISTS message_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_name TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Groups tablosu
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group Contacts ilişki tablosu (many-to-many)
CREATE TABLE IF NOT EXISTS group_contacts (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, contact_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_message_history_phone ON message_history(phone);
CREATE INDEX IF NOT EXISTS idx_message_history_sent_at ON message_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_group_contacts_group_id ON group_contacts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_contacts_contact_id ON group_contacts(contact_id);

-- İlk kullanıcıyı ekle (kullanıcı adı: admin, şifre: admin123)
INSERT INTO users (username, password) VALUES ('admin', 'admin123');

-- Boş settings kaydı ekle
INSERT INTO settings (service_id, auth_token) VALUES ('', '');

-- Supabase Storage Bucket oluşturma
-- Not: Bu işlem SQL Editor ile yapılamaz, Supabase Dashboard > Storage > "New Bucket" ile yapılmalıdır
-- Bucket adı: whatsapp-media
-- Public bucket olarak oluşturun

-- Eğer mevcut bir database'iniz varsa ve media alanlarını eklemeniz gerekiyorsa:
-- ALTER TABLE templates ADD COLUMN IF NOT EXISTS media_url TEXT;
-- ALTER TABLE templates ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio'));
-- ALTER TABLE templates ADD COLUMN IF NOT EXISTS media_filename TEXT;
-- ALTER TABLE message_history ADD COLUMN IF NOT EXISTS media_url TEXT;
-- ALTER TABLE message_history ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio'));
-- ALTER TABLE message_history ADD COLUMN IF NOT EXISTS media_filename TEXT;
```

## 3. API Anahtarlarını Alma

1. Supabase Dashboard'da "Settings" > "API" sekmesine gidin
2. "Project URL" ve "anon/public" anahtarını kopyalayın
3. Bu bilgileri projenizin `.env.local` dosyasına ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
YONCU_API_BASE_URL=https://www.yoncu.com
```

## 4. Supabase Storage Kurulumu (Medya Dosyaları İçin)

### Storage Bucket Oluşturma

1. Supabase Dashboard'da **Storage** sekmesine gidin
2. **New Bucket** butonuna tıklayın
3. Bucket ayarları:
   - **Name:** `whatsapp-media`
   - **Public bucket:** ✅ (İşaretli)
   - **File size limit:** 50MB (varsayılan)
4. **Create bucket** butonuna tıklayın

### Storage Politikaları

Storage bucket'ınızın public olarak erişilebilir olması için RLS politikalarını ayarlayın:

```sql
-- Storage için policy oluşturma
-- Supabase Dashboard > Storage > whatsapp-media > Policies

-- Herkese okuma izni (public bucket için)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'whatsapp-media');

-- Authenticated kullanıcılara yazma izni
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'whatsapp-media' AND auth.role() = 'authenticated');

-- Authenticated kullanıcılara silme izni
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'whatsapp-media' AND auth.role() = 'authenticated');
```

**Not:** Geliştirme ortamında, tüm işlemler için genel izin vermek isterseniz:

```sql
-- Herkese tam erişim (sadece geliştirme için!)
CREATE POLICY "Allow all operations"
ON storage.objects
USING (bucket_id = 'whatsapp-media');
```

## 5. Row Level Security (RLS) Ayarları

**Önemli:** Bu proje tek kullanıcılı bir panel olduğu için RLS kapatılmış durumda. Production ortamında mutlaka RLS kuralları ekleyin!

Eğer RLS etkinleştirmek isterseniz (önerilir), her tablo için aşağıdaki politikaları ekleyin:

```sql
-- Her tablo için RLS'i etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_contacts ENABLE ROW LEVEL SECURITY;

-- Tüm işlemler için politika (geliştirme amaçlı - production'da daha kısıtlayıcı yapın)
CREATE POLICY "Enable all for authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON contacts FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON templates FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON settings FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON message_history FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON groups FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON group_contacts FOR ALL USING (true);
```

## 5. Medya Dosyaları Test Etme

### Storage Kontrolü

1. Supabase Dashboard > **Storage** sekmesine gidin
2. `whatsapp-media` bucket'ının oluşturulduğunu kontrol edin
3. Bucket ayarlarında "Public" olarak işaretli olmalı
4. Policies sekmesinde erişim politikalarını kontrol edin

### Test Senaryosu

1. Dashboard'da **Şablonlar** sayfasına gidin
2. Yeni şablon oluşturun
3. Bir görsel dosyası yükleyin (örn: logo.png)
4. Şablonu kaydedin
5. **Mesaj Gönder** sayfasında şablonu seçin
6. Görsel ile birlikte mesaj gönderin

### Sorun Giderme - Media Upload

**"Bucket bulunamadı" Hatası:**
- Storage bucket'ının adının tam olarak `whatsapp-media` olduğunu kontrol edin
- Bucket'ın public olarak işaretli olduğunu onaylayın

**"Yükleme izni yok" Hatası:**
- Storage policies sekmesinde politikaları kontrol edin
- Yukarıdaki SQL politika kodlarını çalıştırın

**"Dosya boyutu fazla" Hatası:**
- Bucket settings'den file size limit'i artırın (max 50MB)
- Veya daha küçük dosya yükleyin

## 6. Test Etme

1. Projenizi çalıştırın: `npm run dev`
2. Login sayfasına gidin: http://localhost:3000/login
3. Kullanıcı adı: `admin`, Şifre: `admin123` ile giriş yapın
4. Dashboard'da her şeyin çalıştığını kontrol edin

## Sorun Giderme

### Bağlantı Hatası
- `.env.local` dosyasının doğru konumda olduğundan emin olun
- Supabase URL ve Key'in doğru kopyalandığını kontrol edin
- Projeyi yeniden başlatın

### Tablo Bulunamadı Hatası
- SQL komutlarının hepsinin başarıyla çalıştırıldığını kontrol edin
- Supabase Dashboard > Table Editor'de tabloların görünür olduğunu onaylayın

### CORS Hatası
- Supabase otomatik olarak CORS'u yönetir
- Eğer hata alıyorsanız, Supabase Dashboard > Authentication > URL Configuration'da domain'inizi ekleyin

## Üretim (Production) İçin

1. `.env.local` yerine Vercel/hosting sağlayıcınızdaki environment variables'ı kullanın
2. RLS politikalarını etkinleştirin ve güvenli hale getirin
3. Database backup'ı etkinleştirin
4. API rate limiting ekleyin
5. Şifreleri hash'li olarak saklayın (bcrypt kullanın)

