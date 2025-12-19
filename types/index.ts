export interface Contact {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  consent?: boolean;
  consent_date?: string;
  consent_source?: string;
  created_at: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  filename?: string;
  caption?: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document' | 'audio';
  media_filename?: string;
  media_items?: MediaItem[]; // Çoklu medya desteği
  link_url?: string; // CTA link URL
  link_text?: string; // CTA link metni
  created_at: string;
  updated_at: string;
}

export interface MessageHistory {
  id: string;
  phone: string;
  message: string;
  contact_name: string | null;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document' | 'audio';
  media_filename?: string;
  status: string;
  channel?: string;
  campaign_id?: string;
  error?: string;
  sent_at: string;
}

export interface Settings {
  id: string;
  service_id: string;
  auth_token: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

export interface YoncuQueueResponse {
  adet: number;
  Phones: string[];
}

export interface YoncuStatusResponse {
  whatsapp_id?: string;
  uye_id?: string;
  siparis_id?: string;
  siparis_urun_id?: string;
  kayit_zamani?: string;
  bitis_zamani?: string;
  status: string; // "1" = aktif, "0" = pasif
  logo?: string;
  sil?: string;
  config?: any;
  warning?: any;
}

export interface YoncuSendRequest {
  Phone: string;
  Message: string;
  MediaUrl?: string;
  MediaType?: 'image' | 'video' | 'document' | 'audio';
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupContact {
  group_id: string;
  contact_id: string;
  added_at: string;
}

// WhatsApp Web/Desktop Types
export interface WaWebSession {
  id: string;
  session_name: string;
  client_id: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'qr_pending';
  qr_code?: string;
  phone_number?: string;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'business_api' | 'wa_web';
  message_template: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document' | 'audio';
  media_filename?: string;
  
  // Hedef kitle
  target_type: 'contacts' | 'groups' | 'manual';
  target_contacts?: string[];
  target_groups?: string[];
  target_manual_phones?: string[];
  
  // Gönderim ayarları
  rate_limit_per_second: number;
  rate_limit_per_minute: number;
  add_random_delay: boolean;
  delay_min_ms: number;
  delay_max_ms: number;
  
  // Uyum kontrolleri
  require_consent: boolean;
  content_quality_check: boolean;
  
  // Durum
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
  
  // İstatistikler
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
}

export interface SendJob {
  id: string;
  campaign_id: string;
  recipient_phone: string;
  recipient_name?: string;
  recipient_contact_id?: string;
  message_content: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document' | 'audio';
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'blocked';
  attempts: number;
  max_attempts: number;
  last_error?: string;
  last_error_at?: string;
  scheduled_at: string;
  processed_at?: string;
  sent_at?: string;
  created_at: string;
}

export interface Blacklist {
  id: string;
  phone: string;
  reason: string;
  added_at: string;
}

// WA Web Contact (whatsapp-web.js'den gelen)
export interface WaWebContact {
  id: {
    _serialized: string;
    user: string;
  };
  name?: string;
  pushname?: string;
  number: string;
  isMyContact: boolean;
  isUser: boolean;
  isGroup: boolean;
  isWAContact: boolean;
}

// WA Web Group
export interface WaWebGroup {
  id: {
    _serialized: string;
  };
  name: string;
  participants: Array<{
    id: {
      _serialized: string;
      user: string;
    };
  }>;
}

// Campaign Preview
export interface CampaignPreview {
  recipient_phone: string;
  recipient_name?: string;
  rendered_message: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document' | 'audio';
  media_filename?: string;
}

// Campaign Report
export interface CampaignReport {
  campaign: Campaign;
  jobs: SendJob[];
  summary: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    blocked: number;
    success_rate: number;
  };
  errors: Array<{
    error: string;
    count: number;
  }>;
}

