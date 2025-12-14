import { supabase } from '../supabase';
import { Blacklist } from '@/types';

/**
 * Telefon numarasının blacklist'te olup olmadığını kontrol eder
 */
export async function isPhoneBlacklisted(phone: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blacklist')
    .select('id')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data !== null;
}

/**
 * Blacklist'e ekler
 */
export async function addToBlacklist(phone: string, reason = 'user_requested'): Promise<Blacklist> {
  const { data, error } = await supabase
    .from('blacklist')
    .insert([{ phone, reason }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Blacklist'ten çıkarır
 */
export async function removeFromBlacklist(phone: string): Promise<void> {
  const { error } = await supabase
    .from('blacklist')
    .delete()
    .eq('phone', phone);

  if (error) throw error;
}

/**
 * Tüm blacklist'i getirir
 */
export async function getAllBlacklist(): Promise<Blacklist[]> {
  const { data, error } = await supabase
    .from('blacklist')
    .select('*')
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

