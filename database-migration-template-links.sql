-- Template'lere link/CTA ve çoklu medya desteği ekleme
-- Supabase SQL Editor'da çalıştırın

-- 1. Template tablosuna link alanları ekle
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS link_url TEXT,
ADD COLUMN IF NOT EXISTS link_text TEXT;

-- 2. Çoklu medya için yeni tablo oluştur
CREATE TABLE IF NOT EXISTS template_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  media_filename TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Index oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_template_media_template_id ON template_media(template_id);
CREATE INDEX IF NOT EXISTS idx_template_media_order ON template_media(template_id, display_order);

-- 4. Mevcut template'lerdeki tek medyayı template_media tablosuna taşı (opsiyonel)
-- Sadece media_url'si olan template'ler için
INSERT INTO template_media (template_id, media_url, media_type, media_filename, display_order)
SELECT 
  id, 
  media_url, 
  COALESCE(media_type, 'document'),
  media_filename,
  0
FROM templates
WHERE media_url IS NOT NULL
ON CONFLICT DO NOTHING;

COMMENT ON COLUMN templates.link_url IS 'Call-to-Action link URL';
COMMENT ON COLUMN templates.link_text IS 'Call-to-Action link display text';
COMMENT ON TABLE template_media IS 'Multiple media attachments for templates';

