import { supabase } from '@/lib/supabase'
import { Contact } from '@/types'

export async function getContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getContactById(id: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .update(contact)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function bulkDeleteContacts(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .in('id', ids)

  if (error) throw error
}

export async function bulkCreateContacts(contacts: Omit<Contact, 'id' | 'created_at'>[]): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contacts)
    .select()

  if (error) throw error
  return data
}

export async function searchContacts(query: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .or(`name.ilike.%${query}%,surname.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

