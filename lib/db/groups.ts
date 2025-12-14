import { supabase } from '@/lib/supabase'
import { Group, Contact } from '@/types'

export async function getGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getGroupById(id: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createGroup(group: { name: string; description?: string }): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: group.name,
      description: group.description,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGroup(id: string, group: Partial<Group>): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .update(group)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGroup(id: string): Promise<void> {
  // Önce grup ilişkilerini sil
  await removeAllContactsFromGroup(id)
  
  // Sonra grubu sil
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Grup - Kişi İlişkileri
export async function addContactsToGroup(groupId: string, contactIds: string[]): Promise<void> {
  const entries = contactIds.map(contactId => ({
    group_id: groupId,
    contact_id: contactId,
  }))

  const { error } = await supabase
    .from('group_contacts')
    .insert(entries)

  if (error) throw error
}

export async function removeContactFromGroup(groupId: string, contactId: string): Promise<void> {
  const { error } = await supabase
    .from('group_contacts')
    .delete()
    .eq('group_id', groupId)
    .eq('contact_id', contactId)

  if (error) throw error
}

export async function removeAllContactsFromGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('group_contacts')
    .delete()
    .eq('group_id', groupId)

  if (error) throw error
}

export async function getGroupContacts(groupId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('group_contacts')
    .select(`
      contact_id,
      contacts (*)
    `)
    .eq('group_id', groupId)

  if (error) throw error
  
  // Transform the nested data
  return (data || []).map((item: any) => item.contacts).filter(Boolean)
}

export async function getContactGroups(contactId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('group_contacts')
    .select(`
      group_id,
      groups (*)
    `)
    .eq('contact_id', contactId)

  if (error) throw error
  
  // Transform the nested data
  return (data || []).map((item: any) => item.groups).filter(Boolean)
}

export async function getGroupWithContactCount(): Promise<Array<Group & { contact_count: number }>> {
  const groups = await getGroups()
  
  const groupsWithCounts = await Promise.all(
    groups.map(async (group) => {
      const { count, error } = await supabase
        .from('group_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)
      
      return {
        ...group,
        contact_count: count || 0,
      }
    })
  )
  
  return groupsWithCounts
}
