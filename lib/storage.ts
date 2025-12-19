import { createAdminSupabaseClient } from './supabase-admin'

const BUCKET_NAME = 'whatsapp-media'

// Dosya tiplerini belirle
export function getMediaType(filename: string): 'image' | 'video' | 'document' | 'audio' {
  const ext = filename.toLowerCase().split('.').pop() || ''
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac']
  
  if (imageExts.includes(ext)) return 'image'
  if (videoExts.includes(ext)) return 'video'
  if (audioExts.includes(ext)) return 'audio'
  
  return 'document'
}

// Dosya yükle
export async function uploadFile(
  file: File,
  path?: string
): Promise<{ url: string; path: string; type: 'image' | 'video' | 'document' | 'audio' }> {
  try {
    const supabase = createAdminSupabaseClient()

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    // Dosyayı yükle
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Public URL al
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path,
      type: getMediaType(file.name),
    }
  } catch (error: any) {
    throw new Error(`Dosya yükleme hatası: ${error.message}`)
  }
}

// Dosyayı sil
export async function deleteFile(path: string): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient()
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) throw error
  } catch (error: any) {
    throw new Error(`Dosya silme hatası: ${error.message}`)
  }
}

// Public URL al
export function getPublicUrl(path: string): string {
  const supabase = createAdminSupabaseClient()
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
  return data.publicUrl
}

// Dosya boyutu kontrolü (max 50MB)
export function validateFileSize(file: File, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// Dosya tipi kontrolü
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/webm',
    'video/x-matroska',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
  ]

  return allowedTypes.includes(file.type) || file.type.startsWith('application/')
}

// Format dosya boyutunu okunabilir hale getir
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
