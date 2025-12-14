import { supabase } from '@/lib/supabase'
import { MessageHistory } from '@/types'

export async function getMessageHistory(limit?: number): Promise<MessageHistory[]> {
  let query = supabase
    .from('message_history')
    .select('*')
    .order('sent_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createMessageHistory(
  message: Omit<MessageHistory, 'id' | 'sent_at'>
): Promise<MessageHistory> {
  const { data, error } = await supabase
    .from('message_history')
    .insert(message)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function searchMessageHistory(query: string): Promise<MessageHistory[]> {
  const { data, error } = await supabase
    .from('message_history')
    .select('*')
    .or(`phone.ilike.%${query}%,message.ilike.%${query}%,contact_name.ilike.%${query}%`)
    .order('sent_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function filterMessageHistoryByDate(
  startDate: string,
  endDate: string
): Promise<MessageHistory[]> {
  const { data, error } = await supabase
    .from('message_history')
    .select('*')
    .gte('sent_at', startDate)
    .lte('sent_at', endDate)
    .order('sent_at', { ascending: false })

  if (error) throw error
  return data || []
}

