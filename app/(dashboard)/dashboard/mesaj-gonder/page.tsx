'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Contact, Template } from '@/types'
import { Send, Users, FileText, Upload, X, Image as ImageIcon, Video, Music, File, Smartphone } from 'lucide-react'
import { formatPhoneNumber, delay } from '@/lib/utils'
import { motion } from 'framer-motion'

type SendMode = 'single' | 'multiple'
type SendChannel = 'yoncu' | 'wa-web'

interface Group {
  id: string
  name: string
  description?: string
  contact_count?: number
}

export default function SendMessagePage() {
  const { toast } = useToast()
  const [mode, setMode] = useState<SendMode>('single')
  const [channel, setChannel] = useState<SendChannel>('wa-web')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedContact, setSelectedContact] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState('none')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [customPhone, setCustomPhone] = useState('')
  const [message, setMessage] = useState('')
  const [bulkPhones, setBulkPhones] = useState('')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [messageTextareaRef, setMessageTextareaRef] = useState<HTMLTextAreaElement | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<Array<{
    url: string
    type: 'image' | 'video' | 'document' | 'audio'
    filename: string
  }>>([])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  const placeholders = [
    { label: 'Ad', value: '{name}', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
    { label: 'Soyad', value: '{surname}', color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20' },
    { label: 'E-posta', value: '{email}', color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20' },
    { label: 'Adres', value: '{address}', color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' },
    { label: 'Şirket', value: '{company}', color: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20' },
  ]

  const insertPlaceholder = (placeholder: string) => {
    if (!messageTextareaRef) return

    const start = messageTextareaRef.selectionStart
    const end = messageTextareaRef.selectionEnd
    const currentMessage = message || ''
    
    const newMessage = 
      currentMessage.substring(0, start) +
      placeholder +
      currentMessage.substring(end)
    
    setMessage(newMessage)
    
    // Cursor pozisyonunu placeholder'ın sonuna taşı
    setTimeout(() => {
      messageTextareaRef.focus()
      messageTextareaRef.setSelectionRange(start + placeholder.length, start + placeholder.length)
    }, 0)
  }

  useEffect(() => {
    fetchContacts()
    fetchTemplates()
    fetchGroups()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Fetch contacts error:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups?withCount=true')
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Fetch groups error:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Fetch templates error:', error)
    }
  }

  const handleGroupSelect = async (groupId: string) => {
    setSelectedGroup(groupId)
    // "none" değeri seçimi kaldırmak için kullanılır
    if (groupId && groupId !== 'none') {
      try {
        const response = await fetch(`/api/groups/${groupId}/contacts`)
        if (response.ok) {
          const groupContacts = await response.json()
          setSelectedContacts(groupContacts.map((c: Contact) => c.id))
        }
      } catch (error) {
        console.error('Fetch group contacts error:', error)
      }
    } else {
      setSelectedContacts([])
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setMessage(template.content)
      
      // Şablonda media varsa, onu da yükle
      if (template.media_url) {
        setUploadedMedia([{
          url: template.media_url,
          type: template.media_type || 'document',
          filename: template.media_filename || 'file',
        }])
      }
      
      // Şablonda link varsa, onu da yükle
      if (template.link_url) {
        setLinkUrl(template.link_url)
        setLinkText(template.link_text || '')
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Her dosya için boyut kontrolü
    const invalidFiles = files.filter(f => f.size > 50 * 1024 * 1024)
    if (invalidFiles.length > 0) {
      toast({
        title: 'Hata!',
        description: `${invalidFiles.length} dosya 50MB'dan büyük. Bu dosyalar eklenmedi.`,
        variant: 'destructive',
      })
      return
    }

    // Maksimum 5 dosya
    if (mediaFiles.length + files.length > 5) {
      toast({
        title: 'Hata!',
        description: 'Maksimum 5 medya dosyası ekleyebilirsiniz.',
        variant: 'destructive',
      })
      return
    }

    setMediaFiles(prev => [...prev, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleClearAllFiles = () => {
    setMediaFiles([])
    setUploadedMedia([])
  }

  const uploadMediaFiles = async (): Promise<Array<{
    url: string
    type: 'image' | 'video' | 'document' | 'audio'
    filename: string
  }>> => {
    // Önceden yüklenmiş medya varsa ve yeni dosya yoksa
    if (mediaFiles.length === 0 && uploadedMedia.length > 0) {
      return uploadedMedia
    }

    if (mediaFiles.length === 0) return []

    setUploading(true)
    const results: Array<{
      url: string
      type: 'image' | 'video' | 'document' | 'audio'
      filename: string
    }> = []

    try {
      for (const file of mediaFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`${file.name}: ${error.error || 'Yüklenemedi'}`)
        }

        const data = await response.json()
        results.push({
          url: data.url,
          type: data.type,
          filename: data.filename,
        })
      }

      setUploadedMedia(results)
      return results
    } catch (error: any) {
      toast({
        title: 'Hata!',
        description: error.message || 'Dosyalar yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
      return []
    } finally {
      setUploading(false)
    }
  }

  const getMediaIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (file.type.startsWith('audio/')) return <Music className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
  }

  const sendSingleMessage = async (
    phone: string,
    msg: string,
    contactName?: string,
    media?: { url: string; type: 'image' | 'video' | 'document' | 'audio'; filename: string }
  ) => {
    const endpoint = channel === 'wa-web' ? '/api/wa-web/send' : '/api/yoncu/send'
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        channel === 'wa-web'
          ? {
              phone,
              message: msg,
              media: media?.url,
            }
          : {
              phone,
              message: msg,
              contactName,
              mediaUrl: media?.url,
              mediaType: media?.type,
              mediaFilename: media?.filename,
            }
      ),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Gönderim başarısız')
    }

    return await response.json()
  }

  const handleSingleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Hata!',
        description: 'Mesaj içeriği boş olamaz.',
        variant: 'destructive',
      })
      return
    }

    let phone = ''
    let contactName = ''
    let firstName = 'Değerli Müşterimiz'
    let lastName = ''
    let email = ''
    let address = ''
    let company = ''

    if (selectedContact) {
      const contact = contacts.find((c) => c.id === selectedContact)
      if (contact) {
        phone = contact.phone
        contactName = `${contact.name} ${contact.surname}`
        firstName = contact.name
        lastName = contact.surname
        email = contact.email || ''
        address = contact.address || ''
        company = contact.company || ''
      }
    } else if (customPhone) {
      phone = formatPhoneNumber(customPhone)
    } else {
      toast({
        title: 'Hata!',
        description: 'Lütfen bir kişi seçin veya telefon numarası girin.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      // Medya yükleme (varsa)
      const mediaItems = await uploadMediaFiles()

      let finalMessage = message.replace(/{name}/g, firstName)
      finalMessage = finalMessage.replace(/{surname}/g, lastName)
      finalMessage = finalMessage.replace(/{email}/g, email)
      finalMessage = finalMessage.replace(/{address}/g, address)
      finalMessage = finalMessage.replace(/{company}/g, company)

      // Link ekle (varsa)
      if (linkUrl) {
        const linkMessage = linkText 
          ? `\n\n👉 ${linkText}\n${linkUrl}` 
          : `\n\n🔗 ${linkUrl}`;
        finalMessage += linkMessage;
      }

      // WhatsApp Web için çoklu medya gönderimi
      if (channel === 'wa-web' && mediaItems.length > 0) {
        const response = await fetch('/api/wa-web/send-multi-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            message: finalMessage,
            mediaItems: mediaItems.map(m => ({
              type: m.type,
              data: m.url,
              filename: m.filename
            })),
            linkUrl,
            linkText
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Gönderim başarısız')
        }
      } else {
        // Yoncu API veya tek medya
        await sendSingleMessage(phone, finalMessage, contactName || undefined, mediaItems[0] || undefined)
      }

      toast({
        title: 'Başarılı!',
        description: 'Mesaj başarıyla gönderildi.',
      })

      // Reset form
      setSelectedContact('')
      setCustomPhone('')
      setMessage('')
      setSelectedTemplate('')
      setLinkUrl('')
      setLinkText('')
      handleClearAllFiles()
    } catch (error: any) {
      toast({
        title: 'Hata!',
        description: error.message || 'Mesaj gönderilemedi.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleMultipleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Hata!',
        description: 'Mesaj içeriği boş olamaz.',
        variant: 'destructive',
      })
      return
    }

    let phonesToSend: Array<{ 
      phone: string; 
      name: string; 
      surname: string;
      email: string;
      address: string;
      company: string;
    }> = []

    // From selected contacts
    if (selectedContacts.length > 0) {
      phonesToSend = selectedContacts.map((id) => {
        const contact = contacts.find((c) => c.id === id)!
        return {
          phone: contact.phone,
          name: contact.name,
          surname: contact.surname,
          email: contact.email || '',
          address: contact.address || '',
          company: contact.company || '',
        }
      })
    }

    // From bulk phones textarea
    if (bulkPhones.trim()) {
      const phones = bulkPhones
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p)
        .map((p) => ({
          phone: formatPhoneNumber(p),
          name: 'Değerli Müşterimiz',
          surname: '',
          email: '',
          address: '',
          company: '',
        }))
      phonesToSend = [...phonesToSend, ...phones]
    }

    if (phonesToSend.length === 0) {
      toast({
        title: 'Hata!',
        description: 'Lütfen en az bir kişi seçin veya telefon numarası girin.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    setProgress({ current: 0, total: phonesToSend.length })

    // Medya yükleme (varsa) - toplu gönderimde bir kez yükle
    const mediaItems = await uploadMediaFiles()

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < phonesToSend.length; i++) {
      const { phone, name, surname, email, address, company } = phonesToSend[i]
      try {
        let finalMessage = message.replace(/{name}/g, name)
        finalMessage = finalMessage.replace(/{surname}/g, surname || '')
        finalMessage = finalMessage.replace(/{email}/g, email || '')
        finalMessage = finalMessage.replace(/{address}/g, address || '')
        finalMessage = finalMessage.replace(/{company}/g, company || '')
        
        // Link ekle (varsa)
        if (linkUrl) {
          const linkMessage = linkText 
            ? `\n\n👉 ${linkText}\n${linkUrl}` 
            : `\n\n🔗 ${linkUrl}`;
          finalMessage += linkMessage;
        }

        // WhatsApp Web için çoklu medya gönderimi
        if (channel === 'wa-web' && mediaItems.length > 0) {
          const response = await fetch('/api/wa-web/send-multi-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone,
              message: finalMessage,
              mediaItems: mediaItems.map(m => ({
                type: m.type,
                data: m.url,
                filename: m.filename
              })),
              linkUrl,
              linkText
            })
          })
          
          if (!response.ok) throw new Error('Gönderim başarısız')
        } else {
          // Yoncu API veya tek medya
          await sendSingleMessage(
            phone, 
            finalMessage, 
            name !== 'Değerli Müşterimiz' ? name : undefined,
            mediaItems[0] || undefined
          )
        }
        
        successCount++
        
        // Delay between messages (2 seconds - rate limit için)
        if (i < phonesToSend.length - 1) {
          await delay(2000)
        }
      } catch (error) {
        failCount++
        console.error(`Failed to send to ${phone}:`, error)
      }
      setProgress({ current: i + 1, total: phonesToSend.length })
    }

    setSending(false)
    setProgress({ current: 0, total: 0 })

    toast({
      title: 'Gönderim Tamamlandı!',
      description: `${successCount} başarılı, ${failCount} başarısız.`,
    })

    // Reset form
    setSelectedContacts([])
    setSelectedGroup('none')
    setBulkPhones('')
    setMessage('')
    setSelectedTemplate('')
    setLinkUrl('')
    setLinkText('')
    handleClearAllFiles()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mesaj Gönder</h1>
        <p className="text-muted-foreground mt-1">
          Tekil veya toplu mesaj gönderin
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'single' ? 'default' : 'outline'}
          onClick={() => setMode('single')}
          className="flex-1"
        >
          <Send className="mr-2 h-4 w-4" />
          Tekil Gönderim
        </Button>
        <Button
          variant={mode === 'multiple' ? 'default' : 'outline'}
          onClick={() => setMode('multiple')}
          className="flex-1"
        >
          <Users className="mr-2 h-4 w-4" />
          Çoğul Gönderim
        </Button>
      </div>

      {/* Channel Selection */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gönderim Kanalı</CardTitle>
          <CardDescription>
            Mesajları hangi kanal üzerinden göndermek istersiniz?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setChannel('wa-web')}
              className={`p-4 rounded-lg border-2 transition-all ${
                channel === 'wa-web'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Smartphone className={`h-8 w-8 ${channel === 'wa-web' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-center">
                  <p className="font-semibold text-sm">WhatsApp Web</p>
                  <p className="text-xs text-muted-foreground">Kişisel hesap</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setChannel('yoncu')}
              className={`p-4 rounded-lg border-2 transition-all ${
                channel === 'yoncu'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Send className={`h-8 w-8 ${channel === 'yoncu' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-center">
                  <p className="font-semibold text-sm">Yoncu API</p>
                  <p className="text-xs text-muted-foreground">Business API</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Single Send Mode */}
      {mode === 'single' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Alıcı Bilgileri</CardTitle>
              <CardDescription>
                Kayıtlı bir kişi seçin veya telefon numarası girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kayıtlı Kişi Seç</Label>
                <Select value={selectedContact} onValueChange={setSelectedContact}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kişi seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} {contact.surname} - {contact.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t" />
                <span className="text-sm text-muted-foreground">VEYA</span>
                <div className="flex-1 border-t" />
              </div>

              <div className="space-y-2">
                <Label>Telefon Numarası</Label>
                <Input
                  placeholder="+905001112233 veya 5001112233"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  disabled={!!selectedContact}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesaj İçeriği</CardTitle>
              <CardDescription>
                Şablon seçin veya manuel mesaj yazın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Şablon Seç (Opsiyonel)</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şablon seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mesaj</Label>
                <Textarea
                  placeholder="Mesajınızı yazın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="font-mono"
                  ref={(e) => setMessageTextareaRef(e)}
                />
                
                {/* Placeholder Butonları */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Kişiselleştirme ekle:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {placeholders.map((placeholder) => (
                      <button
                        key={placeholder.value}
                        type="button"
                        onClick={() => insertPlaceholder(placeholder.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${placeholder.color}`}
                      >
                        {placeholder.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Media Upload - Çoklu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Medya Dosyaları (Opsiyonel - Max 5)</Label>
                  {mediaFiles.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllFiles}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tümünü Temizle
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {mediaFiles.length < 5 && (
                    <label
                      htmlFor="media-upload-single"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          Görsel, video, belge ekle ({mediaFiles.length}/5)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 50MB per dosya
                        </p>
                      </div>
                      <input
                        id="media-upload-single"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}

                  {mediaFiles.length > 0 && (
                    <div className="space-y-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMediaIcon(file)}
                            <div className="text-xs">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Link/CTA Section */}
              <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  <Label className="text-base font-semibold">Call-to-Action Link (Opsiyonel)</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link-url-single">Link URL</Label>
                  <Input
                    id="link-url-single"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/kampanya"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link-text-single">Link Metni</Label>
                  <Input
                    id="link-text-single"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Hemen İncele, Detaylar İçin Tıkla, vb."
                  />
                  <p className="text-xs text-muted-foreground">
                    Mesajın sonunda: 👉 [Link Metni] [URL]
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSingleSend}
                disabled={sending || uploading}
                className="w-full"
                size="lg"
              >
                {uploading
                  ? 'Dosya Yükleniyor...'
                  : sending
                  ? 'Gönderiliyor...'
                  : 'Mesajı Gönder'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Multiple Send Mode */}
      {mode === 'multiple' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Alıcılar</CardTitle>
              <CardDescription>
                Grup seçin, kayıtlı kişilerden seçin veya telefon numaraları girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grup Seçimi */}
              {groups.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Grup Seç</Label>
                    {selectedGroup && selectedGroup !== 'none' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGroupSelect('none')}
                        className="h-auto py-1 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Grup Seçimini Kaldır
                      </Button>
                    )}
                  </div>
                  <Select value={selectedGroup} onValueChange={handleGroupSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grup seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.contact_count || 0} kişi)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedGroup && selectedGroup !== 'none' && (
                    <p className="text-xs text-muted-foreground">
                      ✅ Seçilen grubun tüm kişileri otomatik olarak eklendi
                    </p>
                  )}
                </div>
              )}

              {contacts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Kayıtlı Kişiler</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedContacts.length === contacts.length) {
                          setSelectedContacts([])
                        } else {
                          setSelectedContacts(contacts.map(c => c.id))
                        }
                      }}
                    >
                      {selectedContacts.length === contacts.length ? 'Seçimi Temizle' : 'Tümünü Seç'}
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                      >
                        <Checkbox
                          id={contact.id}
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => handleContactToggle(contact.id)}
                        />
                        <label
                          htmlFor={contact.id}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {contact.name} {contact.surname} - {contact.phone}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedContacts.length} kişi seçildi
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t" />
                <span className="text-sm text-muted-foreground">VEYA</span>
                <div className="flex-1 border-t" />
              </div>

              <div className="space-y-2">
                <Label>Telefon Numaraları (Her satıra bir numara)</Label>
                <Textarea
                  placeholder={"+905001112233\n+905002223344\n5003334455"}
                  value={bulkPhones}
                  onChange={(e) => setBulkPhones(e.target.value)}
                  rows={6}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesaj İçeriği</CardTitle>
              <CardDescription>
                Şablon seçin veya manuel mesaj yazın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Şablon Seç (Opsiyonel)</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şablon seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <FileText className="inline mr-2 h-4 w-4" />
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mesaj</Label>
                <Textarea
                  placeholder="Mesajınızı yazın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="font-mono"
                  ref={(e) => setMessageTextareaRef(e)}
                />
                
                {/* Placeholder Butonları */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Kişiselleştirme ekle:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {placeholders.map((placeholder) => (
                      <button
                        key={placeholder.value}
                        type="button"
                        onClick={() => insertPlaceholder(placeholder.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${placeholder.color}`}
                      >
                        {placeholder.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Media Upload - Çoklu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Medya Dosyaları (Opsiyonel - Max 5)</Label>
                  {mediaFiles.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllFiles}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tümünü Temizle
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {mediaFiles.length < 5 && (
                    <label
                      htmlFor="media-upload-multiple"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          Görsel, video, belge ekle ({mediaFiles.length}/5)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 50MB per dosya
                        </p>
                      </div>
                      <input
                        id="media-upload-multiple"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}

                  {mediaFiles.length > 0 && (
                    <div className="space-y-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMediaIcon(file)}
                            <div className="text-xs">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aynı medyalar tüm alıcılara gönderilecektir (sırayla)
                </p>
              </div>

              {/* Link/CTA Section */}
              <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  <Label className="text-base font-semibold">Call-to-Action Link (Opsiyonel)</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link-url-multiple">Link URL</Label>
                  <Input
                    id="link-url-multiple"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/kampanya"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link-text-multiple">Link Metni</Label>
                  <Input
                    id="link-text-multiple"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Hemen İncele, Detaylar İçin Tıkla, vb."
                  />
                  <p className="text-xs text-muted-foreground">
                    Her mesajın sonunda: 👉 [Link Metni] [URL]
                  </p>
                </div>
              </div>

              {sending && progress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>İlerleme</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleMultipleSend}
                disabled={sending || uploading}
                className="w-full"
                size="lg"
              >
                {uploading
                  ? 'Dosya Yükleniyor...'
                  : sending
                  ? `Gönderiliyor... (${progress.current}/${progress.total})`
                  : 'Toplu Gönder'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

