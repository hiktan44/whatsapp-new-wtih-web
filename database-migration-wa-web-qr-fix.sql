-- ============================================
-- WA Web Sessions - Eksik Kolonlar Ekleme
-- ============================================
-- Bu migration sadece eksik olan kolonları ekler
-- Mevcut tablo ve veriler korunur

-- wa_web_sessions tablosuna tüm eksik alanları ekle (yoksa)
DO $$ 
BEGIN
    -- client_id alanı yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wa_web_sessions' 
        AND column_name = 'client_id'
    ) THEN
        ALTER TABLE wa_web_sessions ADD COLUMN client_id TEXT UNIQUE;
        RAISE NOTICE 'client_id alanı eklendi';
    ELSE
        RAISE NOTICE 'client_id alanı zaten mevcut';
    END IF;

    -- qr_code alanı yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wa_web_sessions' 
        AND column_name = 'qr_code'
    ) THEN
        ALTER TABLE wa_web_sessions ADD COLUMN qr_code TEXT;
        RAISE NOTICE 'qr_code alanı eklendi';
    ELSE
        RAISE NOTICE 'qr_code alanı zaten mevcut';
    END IF;

    -- phone_number alanı yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wa_web_sessions' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE wa_web_sessions ADD COLUMN phone_number TEXT;
        RAISE NOTICE 'phone_number alanı eklendi';
    ELSE
        RAISE NOTICE 'phone_number alanı zaten mevcut';
    END IF;

    -- last_connected_at alanı yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wa_web_sessions' 
        AND column_name = 'last_connected_at'
    ) THEN
        ALTER TABLE wa_web_sessions ADD COLUMN last_connected_at TIMESTAMP;
        RAISE NOTICE 'last_connected_at alanı eklendi';
    ELSE
        RAISE NOTICE 'last_connected_at alanı zaten mevcut';
    END IF;

    -- updated_at alanı yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wa_web_sessions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE wa_web_sessions ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'updated_at alanı eklendi';
    ELSE
        RAISE NOTICE 'updated_at alanı zaten mevcut';
    END IF;
END $$;

-- session_name üzerinde UNIQUE constraint ekle (upsert için gerekli)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wa_web_sessions_session_name_key'
    ) THEN
        ALTER TABLE wa_web_sessions ADD CONSTRAINT wa_web_sessions_session_name_key UNIQUE (session_name);
        RAISE NOTICE 'session_name UNIQUE constraint eklendi';
    ELSE
        RAISE NOTICE 'session_name UNIQUE constraint zaten mevcut';
    END IF;
END $$;

-- Başarı mesajı
SELECT 'Tüm WA Web Sessions alanları ve constraint''ler başarıyla kontrol edildi!' as result;

