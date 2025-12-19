'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Template } from '@/types'
import { useState, useEffect } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Video, Music, Link2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const templateSchema = z.object({
  name: z.string().min(1, 'Şablon adı gereklidir'),
  content: z.string().min(1, 'Mesaj içeriği gereklidir'),
  media_url: z.string().optional(),
  media_type: z.enum(['image', 'video', 'document', 'audio']).optional(),
  media_filename: z.string().optional(),
  link_url: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  link_text: z.string().optional(),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface TemplateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: Template | null
  onSuccess: () => void
}

export function TemplateForm({ open, onOpenChange, template, onSuccess }: TemplateFormProps) {
  const { toast } = useToast()
  const [preview, setPreview] = useState('')
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  })

  const content = watch('content')

  const insertPlaceholder = (placeholder: string) => {
    if (!textareaRef) return

    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const currentContent = content || ''
    
    const newContent = 
      currentContent.substring(0, start) +
      placeholder +
      currentContent.substring(end)
    
    setValue('content', newContent)
    
    // Cursor pozisyonunu placeholder'ın sonuna taşı
    setTimeout(() => {
      textareaRef.focus()
      textareaRef.setSelectionRange(start + placeholder.length, start + placeholder.length)
    }, 0)
  }

  const placeholders = [
    { label: 'Ad', value: '{name}', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
    { label: 'Soyad', value: '{surname}', color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20' },
    { label: 'E-posta', value: '{email}', color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20' },
    { label: 'Adres', value: '{address}', color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' },
    { label: 'Şirket', value: '{company}', color: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20' },
  ]

  // Template değiştiğinde formu güncelle
  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        content: template.content,
        media_url: template.media_url,
        media_type: template.media_type,
        media_filename: template.media_filename,
        link_url: template.link_url || '',
        link_text: template.link_text || '',
      })
      setMediaPreview(template.media_url || null)
    } else {
      reset({
        name: '',
        content: '',
        media_url: undefined,
        media_type: undefined,
        media_filename: undefined,
        link_url: '',
        link_text: '',
      })
      setMediaPreview(null)
    }
    setMediaFile(null)
  }, [template, reset])

  // Dialog kapandığında formu temizle
  useEffect(() => {
    if (!open) {
      setPreview('')
      setMediaFile(null)
      setMediaPreview(null)
    }
  }, [open])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Boyut kontrolü (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Hata!',
        description: 'Dosya boyutu 50MB\'dan küçük olmalıdır.',
        variant: 'destructive',
      })
      return
    }

    setMediaFile(file)
    
    // Önizleme oluştur
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setMediaPreview(null)
    }
  }

  const handleRemoveFile = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setValue('media_url', undefined)
    setValue('media_type', undefined)
    setValue('media_filename', undefined)
  }

  const uploadMedia = async (): Promise<{
    url: string
    type: 'image' | 'video' | 'document' | 'audio'
    filename: string
  } | null> => {
    if (!mediaFile) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', mediaFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Dosya yüklenemedi')
      }

      const data = await response.json()
      return {
        url: data.url,
        type: data.type,
        filename: data.filename,
      }
    } catch (error: any) {
      toast({
        title: 'Hata!',
        description: error.message || 'Dosya yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const getMediaIcon = (type?: string) => {
    if (!type && mediaFile) {
      if (mediaFile.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
      if (mediaFile.type.startsWith('video/')) return <Video className="h-4 w-4" />
      if (mediaFile.type.startsWith('audio/')) return <Music className="h-4 w-4" />
      return <FileText className="h-4 w-4" />
    }
    
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const generatePreview = () => {
    const sampleData = {
      name: 'Ahmet',
      surname: 'Yılmaz',
      email: 'ahmet.yilmaz@email.com',
      address: 'İstanbul, Türkiye',
      company: 'ABC Ltd. Şti.'
    }
    
    let preview = content || ''
    preview = preview.replace(/{name}/g, sampleData.name)
    preview = preview.replace(/{surname}/g, sampleData.surname)
    preview = preview.replace(/{email}/g, sampleData.email)
    preview = preview.replace(/{address}/g, sampleData.address)
    preview = preview.replace(/{company}/g, sampleData.company)
    
    // Link ekle (varsa)
    const linkUrl = watch('link_url')
    const linkText = watch('link_text')
    if (linkUrl) {
      const linkMessage = linkText 
        ? `\n\n👉 ${linkText}\n${linkUrl}` 
        : `\n\n🔗 ${linkUrl}`;
      preview += linkMessage;
    }
    
    setPreview(preview)
  }

  const onSubmit = async (data: TemplateFormData) => {
    try {
      // Eğer yeni dosya seçilmişse, önce yükle
      if (mediaFile) {
        const mediaData = await uploadMedia()
        if (mediaData) {
          data.media_url = mediaData.url
          data.media_type = mediaData.type
          data.media_filename = mediaData.filename
        }
      }

      const url = template ? `/api/templates/${template.id}` : '/api/templates'
      const method = template ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('İşlem başarısız')
      }

      toast({
        title: 'Başarılı!',
        description: template ? 'Şablon güncellendi.' : 'Şablon oluşturuldu.',
      })

      reset()
      setPreview('')
      setMediaFile(null)
      setMediaPreview(null)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Form submit error:', error)
      toast({
        title: 'Hata!',
        description: error.message || 'İşlem başarısız oldu.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}</DialogTitle>
          <DialogDescription>
            {template
              ? 'Şablon bilgilerini düzenleyin'
              : 'Yeni bir mesaj şablonu oluşturun. {`{name}`} ve {`{surname}`} kullanarak kişi adı ve soyadını ekleyebilirsiniz'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Şablon Adı</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Örn: Hoşgeldin Mesajı"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Mesaj İçeriği</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder={`Merhaba {name}, hoş geldiniz!`}
              rows={6}
              className="font-mono"
              ref={(e) => {
                register('content').ref(e)
                setTextareaRef(e)
              }}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            
            {/* Placeholder Butonları */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Eklemek için tıklayın:
              </p>
              <div className="flex flex-wrap gap-2">
                {placeholders.map((placeholder) => (
                  <button
                    key={placeholder.value}
                    type="button"
                    onClick={() => insertPlaceholder(placeholder.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${placeholder.color}`}
                  >
                    {placeholder.label} <span className="opacity-60 ml-1">{placeholder.value}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Link/CTA Section */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔗</span>
              <Label className="text-base font-semibold">Call-to-Action Link (Opsiyonel)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Mesajın sonuna otomatik olarak eklenecek link. WhatsApp&apos;ta link önizlemesi gösterilecektir.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL</Label>
              <Input
                id="link_url"
                {...register('link_url')}
                placeholder="https://example.com/kampanya"
                type="url"
              />
              {errors.link_url && (
                <p className="text-sm text-destructive">{errors.link_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_text">Link Metni</Label>
              <Input
                id="link_text"
                {...register('link_text')}
                placeholder="Hemen İncele, Detaylar İçin Tıkla, vb."
              />
              <p className="text-xs text-muted-foreground">
                Link öncesinde gösterilecek metin
              </p>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Medya Dosyası (Opsiyonel)</Label>
            <div className="flex flex-col gap-2">
              {!mediaFile && !mediaPreview && (
                <label
                  htmlFor="media-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Dosya yükle</span> veya sürükle
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Görsel, video, belge veya ses (Max 50MB)
                    </p>
                  </div>
                  <input
                    id="media-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                    onChange={handleFileSelect}
                  />
                </label>
              )}

              {(mediaFile || mediaPreview) && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMediaIcon(watch('media_type'))}
                      <div className="text-sm">
                        <p className="font-medium">
                          {mediaFile?.name || watch('media_filename') || 'Dosya'}
                        </p>
                        {mediaFile && (
                          <p className="text-xs text-muted-foreground">
                            {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {mediaPreview && watch('media_type') === 'image' && (
                    <div className="mt-2">
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Desteklenen formatlar: JPG, PNG, GIF, MP4, PDF, DOC, XLS, MP3, vb.
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Önizleme</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePreview}
              >
                Önizle
              </Button>
            </div>
            {preview && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{preview}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setPreview('')
                setMediaFile(null)
                setMediaPreview(null)
                onOpenChange(false)
              }}
              disabled={isSubmitting || uploading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {uploading
                ? 'Dosya Yükleniyor...'
                : isSubmitting
                ? 'Kaydediliyor...'
                : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

