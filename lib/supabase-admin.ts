/* eslint-env node */
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import process from 'node:process'

/**
 * Server-side (admin) Supabase client.
 *
 * TR: Bu client sadece server tarafında kullanılmalı. Service Role key içerir.
 * EN: This client must be used server-side only. It uses the Service Role key.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE

  if (!url) {
    throw new Error('Supabase URL eksik: NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!serviceKey) {
    throw new Error(
      'Supabase Service Role key eksik. Coolify ENV içine SUPABASE_SERVICE_ROLE_KEY ekleyin.'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

