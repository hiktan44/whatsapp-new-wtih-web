-- WhatsApp Web/Desktop Channel Migration
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. WhatsApp Web Sessions Tablosu
CREATE TABLE IF NOT EXISTS wa_web_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'qr_pending')),
  qr_code TEXT,
  phone_number TEXT,
  last_connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Campaigns Tablosu (toplu gönderim kampanyaları)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('business_api', 'wa_web')),
  message_template TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  
  -- Hedef kitle
  target_type TEXT NOT NULL CHECK (target_type IN ('contacts', 'groups', 'manual')),
  target_contacts UUID[], -- contact id'leri
  target_groups UUID[], -- group id'leri
  target_manual_phones TEXT[], -- manuel numara listesi
  
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
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- 3. Send Jobs Tablosu (kampanya mesaj kuyruğu)
CREATE TABLE IF NOT EXISTS send_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  last_error_at TIMESTAMP,
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Blacklist Tablosu (STOP/İPTAL listesi)
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  reason TEXT DEFAULT 'user_requested',
  added_at TIMESTAMP DEFAULT NOW()
);

-- 5. Opt-in Tablosu (açık rıza takibi)
-- Contacts tablosuna consent alanı ekliyoruz
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS consent_source TEXT;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_wa_web_sessions_status ON wa_web_sessions(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_send_jobs_campaign_id ON send_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_send_jobs_status ON send_jobs(status);
CREATE INDEX IF NOT EXISTS idx_send_jobs_scheduled_at ON send_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON blacklist(phone);

-- 7. Message History'ye campaign_id ekle
ALTER TABLE message_history ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE message_history ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'business_api';

-- 8. Trigger: campaigns updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wa_web_sessions_updated_at BEFORE UPDATE ON wa_web_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS Policies (opsiyonel, production için)
ALTER TABLE wa_web_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON wa_web_sessions FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON campaigns FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON send_jobs FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON blacklist FOR ALL USING (true);

-- 10. İlk WA Web session kaydı
INSERT INTO wa_web_sessions (session_name, status) 
VALUES ('default', 'disconnected')
ON CONFLICT DO NOTHING;

-- Migration tamamlandı!

