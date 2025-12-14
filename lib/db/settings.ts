import { supabase } from '@/lib/supabase'
import { Settings } from '@/types'

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, return null
      return null
    }
    throw error
  }
  return data
}

export async function updateSettings(settings: Omit<Settings, 'id' | 'updated_at'>): Promise<Settings> {
  // First, check if settings exist
  const existing = await getSettings()

  if (existing) {
    // Update existing settings
    const { data, error } = await supabase
      .from('settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('settings')
      .insert(settings)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

