import { supabase } from '@/lib/supabase'
import { Template } from '@/types'

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .update({ ...template, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

