import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }
  return data
}

export async function updateUserCredentials(
  userId: string,
  updates: { username?: string; password?: string }
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }
  return data
}

