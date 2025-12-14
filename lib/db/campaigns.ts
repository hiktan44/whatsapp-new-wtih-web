import { supabase } from '../supabase';
import { Campaign, SendJob } from '@/types';

/**
 * Tüm kampanyaları getirir
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Kampanya oluşturur
 */
export async function createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Kampanyayı ID ile getirir
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Kampanya günceller
 */
export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Kampanya siler
 */
export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Send job oluşturur
 */
export async function createSendJob(job: Partial<SendJob>): Promise<SendJob> {
  const { data, error } = await supabase
    .from('send_jobs')
    .insert([job])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Send job'ları toplu oluşturur
 */
export async function createSendJobsBulk(jobs: Partial<SendJob>[]): Promise<SendJob[]> {
  const { data, error } = await supabase
    .from('send_jobs')
    .insert(jobs)
    .select();

  if (error) throw error;
  return data || [];
}

/**
 * Kampanya için bekleyen job'ları getirir
 */
export async function getPendingSendJobs(campaignId: string, limit = 10): Promise<SendJob[]> {
  const { data, error } = await supabase
    .from('send_jobs')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Send job günceller
 */
export async function updateSendJob(id: string, updates: Partial<SendJob>): Promise<SendJob> {
  const { data, error } = await supabase
    .from('send_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Kampanya istatistiklerini günceller
 */
export async function updateCampaignStats(campaignId: string): Promise<void> {
  // Job'ları say
  const { data: jobs, error: jobsError } = await supabase
    .from('send_jobs')
    .select('status')
    .eq('campaign_id', campaignId);

  if (jobsError) throw jobsError;

  const total = jobs?.length || 0;
  const sent = jobs?.filter(j => j.status === 'sent').length || 0;
  const failed = jobs?.filter(j => j.status === 'failed').length || 0;

  // Campaign'i güncelle
  await updateCampaign(campaignId, {
    total_recipients: total,
    sent_count: sent,
    failed_count: failed
  });
}

/**
 * Kampanya raporu oluşturur
 */
export async function getCampaignReport(campaignId: string): Promise<{
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
  errors: Array<{ error: string; count: number }>;
}> {
  // Campaign'i getir
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error('Kampanya bulunamadı');

  // Job'ları getir
  const { data: jobs, error: jobsError } = await supabase
    .from('send_jobs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (jobsError) throw jobsError;

  const jobsList = jobs || [];

  // İstatistikler
  const total = jobsList.length;
  const sent = jobsList.filter(j => j.status === 'sent').length;
  const failed = jobsList.filter(j => j.status === 'failed').length;
  const pending = jobsList.filter(j => j.status === 'pending').length;
  const blocked = jobsList.filter(j => j.status === 'blocked').length;
  const success_rate = total > 0 ? (sent / total) * 100 : 0;

  // Hata grupları
  const errorMap = new Map<string, number>();
  jobsList
    .filter(j => j.last_error)
    .forEach(j => {
      const error = j.last_error!;
      errorMap.set(error, (errorMap.get(error) || 0) + 1);
    });

  const errors = Array.from(errorMap.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count);

  return {
    campaign,
    jobs: jobsList,
    summary: {
      total,
      sent,
      failed,
      pending,
      blocked,
      success_rate: Math.round(success_rate * 100) / 100
    },
    errors
  };
}

