import { supabase } from '../supabase';
import { WaWebSession } from '@/types';

/**
 * İsme göre session getirir
 */
export async function getSessionByName(sessionName: string): Promise<WaWebSession | null> {
  const { data, error } = await supabase
    .from('wa_web_sessions')
    .select('*')
    .eq('session_name', sessionName)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Varsayılan session'ı getirir
 */
export async function getDefaultSession(): Promise<WaWebSession | null> {
  return getSessionByName('default');
}

/**
 * Session oluşturur veya günceller
 */
export async function upsertSession(session: Partial<WaWebSession>): Promise<WaWebSession> {
  const { data, error } = await supabase
    .from('wa_web_sessions')
    .upsert([session], { onConflict: 'session_name' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Session durumunu günceller (yoksa oluşturur)
 */
export async function updateSessionStatus(
  sessionName: string,
  status: string,
  qrCode?: string,
  phoneNumber?: string
): Promise<void> {
  const updates: any = { 
    session_name: sessionName,
    client_id: sessionName,
    status 
  };
  
  if (qrCode !== undefined) updates.qr_code = qrCode;
  if (phoneNumber !== undefined) updates.phone_number = phoneNumber;
  if (status === 'connected') updates.last_connected_at = new Date().toISOString();
  
  updates.updated_at = new Date().toISOString();

  // Upsert - kayıt yoksa oluştur, varsa güncelle
  const { error } = await supabase
    .from('wa_web_sessions')
    .upsert([updates], { 
      onConflict: 'session_name',
      ignoreDuplicates: false 
    });

  if (error) throw error;
}

/**
 * Session'ı sıfırlar (QR ve status temizler)
 */
export async function resetSession(sessionName: string): Promise<void> {
  const { error } = await supabase
    .from('wa_web_sessions')
    .update({
      status: 'disconnected',
      qr_code: null,
      phone_number: null,
      updated_at: new Date().toISOString()
    })
    .eq('session_name', sessionName);

  if (error) throw error;
}

/**
 * Session'ı siler
 */
export async function deleteSession(sessionName: string): Promise<void> {
  const { error } = await supabase
    .from('wa_web_sessions')
    .delete()
    .eq('session_name', sessionName);

  if (error) throw error;
}

