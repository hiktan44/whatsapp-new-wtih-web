-- ============================================
-- WhatsApp Yönetim Paneli - KOMPLE DATABASE KURULUM
-- ============================================
-- Bu SQL dosyasını Supabase SQL Editor'da çalıştırın
-- Tüm tablolar, indexler, triggerlar ve ilk veriler oluşturulacak

-- ============================================
-- 1. TEMEL TABLOLAR
-- ============================================

-- Users tablosu (Admin girişi için)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts tablosu (Kişiler)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  company TEXT,
  consent BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates tablosu (Mesaj Şablonları)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  link_url TEXT,
  link_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Media (Çoklu Medya Desteği)
CREATE TABLE IF NOT EXISTS template_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings tablosu (Yöncu API Ayarları)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT NOT NULL,
  auth_token TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups tablosu (Kişi Grupları)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Contacts (Many-to-Many İlişki)
CREATE TABLE IF NOT EXISTS group_contacts (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, contact_id)
);

-- ============================================
-- 2. WHATSAPP WEB TABLOLARI
-- ============================================

-- WhatsApp Web Sessions
CREATE TABLE IF NOT EXISTS wa_web_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL DEFAULT 'default',
  client_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'qr_pending')),
  qr_code TEXT,
  phone_number TEXT,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT wa_web_sessions_session_name_key UNIQUE (session_name)
);

-- Campaigns (Toplu Gönderim Kampanyaları)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('business_api', 'wa_web')),
  message_template TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  
  -- Hedef kitle
  target_type TEXT NOT NULL CHECK (target_type IN ('contacts', 'groups', 'manual')),
  target_contacts UUID[],
  target_groups UUID[],
  target_manual_phones TEXT[],
  
  -- Gönderim ayarları
  rate_limit_per_second INTEGER DEFAULT 1,
  rate_limit_per_minute INTEGER DEFAULT 20,
  add_random_delay BOOLEAN DEFAULT true,
  delay_min_ms INTEGER DEFAULT 1000,
  delay_max_ms INTEGER DEFAULT 3000,
  
  -- Uyum kontrolleri
  require_consent BOOLEAN DEFAULT true,
  content_quality_check BOOLEAN DEFAULT true,
  
  -- Durum
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed')),
  
  -- İstatistikler
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Send Jobs (Kampanya Mesaj Kuyruğu)
CREATE TABLE IF NOT EXISTS send_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Alıcı bilgisi
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  recipient_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Mesaj içeriği (kişiselleştirilmiş)
  message_content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  
  -- Durum
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'blocked')),
  
  -- Hata takibi
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  last_error_at TIMESTAMP WITH TIME ZONE,
  
  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blacklist (STOP/İPTAL Listesi)
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  reason TEXT DEFAULT 'user_requested',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message History (Mesaj Geçmişi)
CREATE TABLE IF NOT EXISTS message_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_name TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  status TEXT DEFAULT 'sent',
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  channel TEXT DEFAULT 'business_api',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INDEXLER (Performans İçin)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_consent ON contacts(consent);

CREATE INDEX IF NOT EXISTS idx_template_media_template_id ON template_media(template_id);
CREATE INDEX IF NOT EXISTS idx_template_media_order ON template_media(template_id, display_order);

CREATE INDEX IF NOT EXISTS idx_group_contacts_group_id ON group_contacts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_contacts_contact_id ON group_contacts(contact_id);

CREATE INDEX IF NOT EXISTS idx_wa_web_sessions_status ON wa_web_sessions(status);
CREATE INDEX IF NOT EXISTS idx_wa_web_sessions_session_name ON wa_web_sessions(session_name);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);

CREATE INDEX IF NOT EXISTS idx_send_jobs_campaign_id ON send_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_send_jobs_status ON send_jobs(status);
CREATE INDEX IF NOT EXISTS idx_send_jobs_scheduled_at ON send_jobs(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON blacklist(phone);

CREATE INDEX IF NOT EXISTS idx_message_history_phone ON message_history(phone);
CREATE INDEX IF NOT EXISTS idx_message_history_sent_at ON message_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_message_history_campaign_id ON message_history(campaign_id);

-- ============================================
-- 4. TRIGGERLAR (Otomatik Güncelleme)
-- ============================================

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggerleri oluştur
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wa_web_sessions_updated_at ON wa_web_sessions;
CREATE TRIGGER update_wa_web_sessions_updated_at 
  BEFORE UPDATE ON wa_web_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- RLS'i etkinleştir (production için önemli!)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_web_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;

-- Tüm işlemler için genel politika (geliştirme amaçlı)
-- Production'da daha kısıtlayıcı politikalar kullanın!
CREATE POLICY "Enable all operations" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON contacts FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON templates FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON template_media FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON settings FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON groups FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON group_contacts FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON wa_web_sessions FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON campaigns FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON send_jobs FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON blacklist FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON message_history FOR ALL USING (true);

-- ============================================
-- 6. İLK VERİLER (Seed Data)
-- ============================================

-- İlk admin kullanıcısı (kullanıcı adı: admin, şifre: admin123)
-- ÖNEMLİ: Production'da şifreyi değiştirin!
INSERT INTO users (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Boş settings kaydı
INSERT INTO settings (service_id, auth_token) 
VALUES ('', '')
ON CONFLICT DO NOTHING;

-- İlk WhatsApp Web session kaydı
INSERT INTO wa_web_sessions (session_name, status) 
VALUES ('default', 'disconnected')
ON CONFLICT (session_name) DO NOTHING;

-- ============================================
-- 7. STORAGE BUCKET POLİTİKALARI
-- ============================================

-- Not: Storage bucket'ı manuel olarak oluşturmanız gerekiyor:
-- 1. Supabase Dashboard > Storage > New Bucket
-- 2. Bucket adı: whatsapp-media
-- 3. Public bucket olarak işaretleyin

-- Storage politikaları (bucket oluşturduktan sonra çalıştırın)
-- Herkese okuma izni
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

-- ============================================
-- KURULUM TAMAMLANDI!
-- ============================================

SELECT 
  '✅ Database kurulumu başarıyla tamamlandı!' as status,
  'Şimdi Supabase Dashboard > Storage > New Bucket ile "whatsapp-media" bucket''ı oluşturun' as next_step;
