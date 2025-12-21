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
import { Send, Users, FileText, Upload, X, Image as ImageIcon, Video, Music, File, Smartphone, Clock } from 'lucide-react'
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
  const [waContacts, setWaContacts] = useState<any[]>([])
  const [waGroups, setWaGroups] = useState<any[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedContact, setSelectedContact] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState('none')
  const [selectedWaGroup, setSelectedWaGroup] = useState('none')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [contactSource, setContactSource] = useState<'manual' | 'whatsapp'>('manual')
  const [customPhone, setCustomPhone] = useState('')
  const [message, setMessage] = useState('')
  const [bulkPhones, setBulkPhones] = useState('')
  const [sending, setSending] = useState(false)
  const [isStopped, setIsStopped] = useState(false) // Stop butonu için
  const [progress, setProgress] = useState<{ 
    current: number; 
    total: number; 
    breakMessage?: string;
    successCount?: number;
    failCount?: number;
    currentPhone?: string;
  }>({ current: 0, total: 0, successCount: 0, failCount: 0 })
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
  
  // Toplu gönderim ayarları
  const [startIndex, setStartIndex] = useState<string>('0')
  const [endIndex, setEndIndex] = useState<string>('')
  const [breakInterval, setBreakInterval] = useState<string>('50') // Kaç mesajdan sonra mola
  const [breakDuration, setBreakDuration] = useState<string>('10') // Mola süresi (dakika)
  const [messageDelay, setMessageDelay] = useState<string>('2') // Mesajlar arası bekleme (saniye)
  
  // Saat planlaması
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  
  // Çoklu session
  const [availableSessions, setAvailableSessions] = useState<any[]>([])
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [useMultiSession, setUseMultiSession] = useState(false)

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
    fetchWAContacts()
    fetchWAGroups()
    fetchSessions()
  }, [])
  
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/wa-web/sessions')
      if (response.ok) {
        const data = await response.json()
        // Sadece bağlı session'ları göster
        const connectedSessions = data.filter((s: any) => s.status === 'connected')
        setAvailableSessions(connectedSessions)
        
        // Varsayılan olarak ilk session'ı seç
        if (connectedSessions.length > 0) {
          setSelectedSessions([connectedSessions[0].session_name])
        }
      }
    } catch (error) {
      console.error('Fetch sessions error:', error)
    }
  }

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

  const fetchWAContacts = async () => {
    try {
      const response = await fetch('/api/wa-web/contacts')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWaContacts(data.contacts)
        }
      }
    } catch (error) {
      console.error('Fetch WA contacts error:', error)
    }
  }

  const fetchWAGroups = async () => {
    try {
      const response = await fetch('/api/wa-web/groups')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWaGroups(data.groups)
        }
      }
    } catch (error) {
      console.error('Fetch WA groups error:', error)
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
    media?: { url: string; type: 'image' | 'video' | 'document' | 'audio'; filename: string },
    sessionName?: string
  ) => {
    const sessionParam = sessionName ? `?session=${sessionName}` : ''
    const endpoint = channel === 'wa-web' 
      ? `/api/wa-web/send${sessionParam}` 
      : '/api/yoncu/send'

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
              sessionName,
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

  // Saat kontrolü fonksiyonu
  const checkTimeRange = (): { inRange: boolean; waitUntil?: Date; message?: string } => {
    if (!scheduleEnabled) {
      return { inRange: true }
    }

    const now = new Date()
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const todayStart = new Date(now)
    todayStart.setHours(startHour, startMinute, 0, 0)

    const todayEnd = new Date(now)
    todayEnd.setHours(endHour, endMinute, 0, 0)

    // Eğer bitiş saati başlangıç saatinden küçükse (gece yarısını geçiyorsa)
    if (todayEnd < todayStart) {
      // Gece yarısını geçen aralık (örn: 22:00 - 06:00)
      if (now >= todayStart) {
        // Başlangıç saatinden sonra, ertesi günün bitiş saatine kadar
        const tomorrowEnd = new Date(todayEnd)
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 1)
        
        if (now <= tomorrowEnd) {
          return { inRange: true }
        } else {
          // Bitiş saati geçti, ertesi günün başlangıç saatine kadar bekle
          const nextStart = new Date(todayStart)
          nextStart.setDate(nextStart.getDate() + 1)
          return { 
            inRange: false, 
            waitUntil: nextStart, 
            message: `Bitiş saati geçti. Ertesi gün ${startTime} saatine kadar bekleniyor.` 
          }
        }
      } else {
        // Başlangıç saatinden önce
        // Bugünün bitiş saati geçmiş mi kontrol et
        const yesterdayEnd = new Date(todayEnd)
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
        
        if (now <= yesterdayEnd) {
          // Dünün bitiş saatinden önce, bugünün başlangıç saatine kadar bekle
          return { 
            inRange: false, 
            waitUntil: todayStart, 
            message: `Başlangıç saatine kadar bekleniyor: ${startTime}` 
          }
        } else {
          // Dünün bitiş saatinden sonra ama bugünün başlangıç saatinden önce
          // Hala geçerli aralık içinde (dün başladı, bugün bitiyor)
          return { inRange: true }
        }
      }
    } else {
      // Normal aralık (gece yarısını geçmiyor)
      if (now >= todayStart && now <= todayEnd) {
        return { inRange: true }
      } else if (now < todayStart) {
        return { 
          inRange: false, 
          waitUntil: todayStart, 
          message: `Başlangıç saatine kadar bekleniyor: ${startTime}` 
        }
      } else {
        // Bitiş saati geçti, ertesi günün başlangıç saatine kadar bekle
        const nextStart = new Date(todayStart)
        nextStart.setDate(nextStart.getDate() + 1)
        return { 
          inRange: false, 
          waitUntil: nextStart, 
          message: `Bitiş saati geçti. Ertesi gün ${startTime} saatine kadar bekleniyor.` 
        }
      }
    }
  }

  // Saat aralığına kadar bekleme fonksiyonu
  const waitUntilTime = async (targetTime: Date): Promise<boolean> => {
    const now = new Date()
    const waitMs = targetTime.getTime() - now.getTime()

    if (waitMs <= 0) {
      return true
    }

    const waitMinutes = Math.ceil(waitMs / 60000)
    toast({
      title: 'Saat Planlaması',
      description: `${waitMinutes} dakika bekleniyor... (${targetTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`,
    })

    // Her dakika bir güncelleme göster
    const intervalMs = 60000 // 1 dakika
    const intervals = Math.ceil(waitMs / intervalMs)

    for (let i = 0; i < intervals; i++) {
      if (isStopped) {
        return false
      }

      const remaining = Math.ceil((targetTime.getTime() - Date.now()) / 60000)
      if (remaining <= 0) {
        break
      }

      setProgress({
        current: 0,
        total: 1,
        breakMessage: `Bekleniyor: ${remaining} dakika kaldı (${targetTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`,
      })

      await delay(Math.min(intervalMs, targetTime.getTime() - Date.now()))
    }

    return true
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

    // Saat kontrolü
    const timeCheck = checkTimeRange()
    if (!timeCheck.inRange) {
      if (timeCheck.waitUntil) {
        const confirmed = window.confirm(
          `${timeCheck.message}\n\nBeklemek istiyor musunuz? (İptal ederseniz gönderim yapılmayacak)`
        )
        if (!confirmed) {
          return
        }

        setSending(true)
        const waited = await waitUntilTime(timeCheck.waitUntil)
        if (!waited) {
          setSending(false)
          return
        }
      } else {
        toast({
          title: 'Saat Planlaması',
          description: timeCheck.message || 'Gönderim için uygun saat değil.',
          variant: 'destructive',
        })
        return
      }
    }

    let phone = ''
    let contactName = ''
    let firstName = 'Değerli Müşterimiz'
    let lastName = ''
    let email = ''
    let address = ''
    let company = ''

    if (selectedContact) {
      if (contactSource === 'manual') {
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
      } else {
        const contact = waContacts.find((c) => c.id === selectedContact)
        if (contact) {
          phone = contact.phone
          contactName = contact.name
          firstName = contact.name
          lastName = ''
          email = ''
          address = ''
          company = ''
        }
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
          const errorMsg = error.error || 'Gönderim başarısız'
          
          // Evaluation failed hatası için özel mesaj
          if (errorMsg.includes('Evaluation failed') || errorMsg.includes('medya gönderiminde hata')) {
            throw new Error('WhatsApp Web medya gönderiminde hata. Lütfen medya dosyalarını kontrol edin veya tekrar deneyin. Sorun devam ederse Chrome\'u yeniden başlatın.')
          }
          
          throw new Error(errorMsg)
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
      const errorMsg = error.message || 'Mesaj gönderilemedi.'
      
      // Özel hata mesajları
      if (errorMsg.includes('Evaluation failed') || errorMsg.includes('medya gönderiminde hata')) {
        toast({
          title: 'Medya Gönderim Hatası',
          description: 'WhatsApp Web medya gönderiminde sorun var. Lütfen medya dosyalarını kontrol edin veya tekrar deneyin.',
          variant: 'destructive',
        })
      } else if (errorMsg.includes('bağlı değil')) {
        toast({
          title: 'Bağlantı Hatası',
          description: 'WhatsApp Web bağlı değil. Lütfen önce bağlantı kurun.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Hata!',
          description: errorMsg,
          variant: 'destructive',
        })
      }
    } finally {
      setSending(false)
    }
  }

  // Toplam kişi sayısını hesapla
  const calculateTotalCount = (): number => {
    let total = 0
    if (selectedGroup && selectedGroup !== 'none') {
      const group = groups.find(g => g.id === selectedGroup)
      total = group?.contact_count || 0
    } else if (selectedWaGroup && selectedWaGroup !== 'none') {
      const group = waGroups.find(g => g.id === selectedWaGroup)
      total = 1 // WhatsApp grubu tekil olarak sayılır
    } else {
      total = selectedContacts.length
    }
    if (bulkPhones.trim()) {
      const phones = bulkPhones.split('\n').filter(p => p.trim())
      total += phones.length
    }
    return total
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

    // Saat kontrolü - başlangıçta kontrol et
    const timeCheck = checkTimeRange()
    if (!timeCheck.inRange) {
      if (timeCheck.waitUntil) {
        const confirmed = window.confirm(
          `${timeCheck.message}\n\nBeklemek istiyor musunuz? (İptal ederseniz gönderim yapılmayacak)`
        )
        if (!confirmed) {
          return
        }

        setSending(true)
        const waited = await waitUntilTime(timeCheck.waitUntil)
        if (!waited) {
          setSending(false)
          return
        }
      } else {
        toast({
          title: 'Saat Planlaması',
          description: timeCheck.message || 'Gönderim için uygun saat değil.',
          variant: 'destructive',
        })
        return
      }
    }

    let phonesToSend: Array<{ 
      phone: string; 
      name: string; 
      surname: string;
      email: string;
      address: string;
      company: string;
    }> = []

    // From selected WhatsApp group (WhatsApp grubu seçildiyse)
    if (selectedWaGroup && selectedWaGroup !== 'none') {
      const group = waGroups.find(g => g.id === selectedWaGroup)
      if (group) {
        // WhatsApp grup ID'sini kullanarak direkt gönder
        phonesToSend = [{
          phone: group.id, // WhatsApp grup ID'si
          name: group.name,
          surname: '',
          email: '',
          address: '',
          company: '',
          isGroup: true // Grup olduğunu belirt
        }]
      }
    }
    // From selected manual group (manuel grup seçildiyse, grubun kişilerini al)
    else if (selectedGroup && selectedGroup !== 'none') {
      try {
        const response = await fetch(`/api/groups/${selectedGroup}/contacts`)
        if (response.ok) {
          const groupContacts = await response.json()
          phonesToSend = groupContacts.map((contact: Contact) => ({
            phone: contact.phone,
            name: contact.name,
            surname: contact.surname || '',
            email: contact.email || '',
            address: contact.address || '',
            company: contact.company || '',
          }))
        }
      } catch (error) {
        console.error('Grup kişileri alınamadı:', error)
      }
    }

    // From selected contacts (grup yoksa veya ek olarak)
    if (selectedGroup === 'none' && selectedContacts.length > 0) {
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

    // Aralık kontrolü
    const start = parseInt(startIndex) || 0
    const end = parseInt(endIndex) || phonesToSend.length
    const breakInt = parseInt(breakInterval) || 50
    const breakDur = parseInt(breakDuration) || 10
    const msgDelay = parseInt(messageDelay) || 2

    if (start < 0 || start >= phonesToSend.length) {
      toast({
        title: 'Hata!',
        description: `Başlangıç index'i geçersiz. 0 ile ${phonesToSend.length - 1} arasında olmalı.`,
        variant: 'destructive',
      })
      return
    }

    if (end <= start || end > phonesToSend.length) {
      toast({
        title: 'Hata!',
        description: `Bitiş index'i geçersiz. ${start + 1} ile ${phonesToSend.length} arasında olmalı.`,
        variant: 'destructive',
      })
      return
    }

    if (breakInt < 1 || breakInt > 1000) {
      toast({
        title: 'Hata!',
        description: 'Mola aralığı 1 ile 1000 arasında olmalı.',
        variant: 'destructive',
      })
      return
    }

    if (breakDur < 10 || breakDur > 60) {
      toast({
        title: 'Hata!',
        description: 'Mola süresi 10 ile 60 dakika arasında olmalı.',
        variant: 'destructive',
      })
      return
    }

    if (msgDelay < 0 || msgDelay > 60) {
      toast({
        title: 'Hata!',
        description: 'Mesajlar arası bekleme süresi 0 ile 60 saniye arasında olmalı.',
        variant: 'destructive',
      })
      return
    }

    // Seçilen aralığı al
    const phonesToSendInRange = phonesToSend.slice(start, end)
    const totalToSend = phonesToSendInRange.length

    setSending(true)
    setIsStopped(false) // Stop durumunu sıfırla
    setProgress({ 
      current: 0, 
      total: totalToSend, 
      successCount: 0, 
      failCount: 0 
    })

    // Medya yükleme (varsa) - toplu gönderimde bir kez yükle
    const mediaItems = await uploadMediaFiles()

    let successCount = 0
    let failCount = 0
    let messagesSinceLastBreak = 0

    for (let i = 0; i < phonesToSendInRange.length; i++) {
      // Stop kontrolü - kullanıcı durdurduysa döngüden çık
      if (isStopped) {
        toast({
          title: 'Gönderim Durduruldu',
          description: `${successCount} mesaj gönderildi, ${phonesToSendInRange.length - i} mesaj kaldı.`,
          variant: 'default',
        })
        break
      }

      // Saat kontrolü - her 10 mesajda bir veya mesajlar arası bekleme sırasında kontrol et
      if (scheduleEnabled && (i % 10 === 0 || i === 0)) {
        const timeCheck = checkTimeRange()
        if (!timeCheck.inRange) {
          toast({
            title: 'Saat Planlaması',
            description: `${timeCheck.message}\n\nGönderim durduruldu. ${successCount} mesaj gönderildi.`,
            variant: 'default',
          })
          break
        }
      }

      const { phone, name, surname, email, address, company, isGroup } = phonesToSendInRange[i]

      // WhatsApp grubuysa formatlama
      const finalPhone = isGroup ? phone : formatPhoneNumber(phone)
      
      // Session seçimi (paralel gönderim için round-robin)
      let sessionToUse = 'default'
      let sessionDisplay = ''
      if (channel === 'wa-web' && selectedSessions.length > 0) {
        // Round-robin: mesaj index'ine göre session seç
        const sessionIndex = i % selectedSessions.length
        sessionToUse = selectedSessions[sessionIndex]
        sessionDisplay = ` (${sessionToUse})`
      }
      
      // Progress güncelle (hangi numaraya gönderiliyor)
      setProgress({
        current: i + 1,
        total: totalToSend,
        successCount,
        failCount,
        currentPhone: finalPhone + sessionDisplay
      })
      
      // Mesajı hazırla
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
      
      try {
        
        // WhatsApp Web için çoklu medya gönderimi
        if (channel === 'wa-web' && mediaItems.length > 0) {
          const response = await fetch(`/api/wa-web/send-multi-media?session=${sessionToUse}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: finalPhone,
              message: finalMessage,
              mediaItems: mediaItems.map(m => ({
                type: m.type,
                data: m.url,
                filename: m.filename
              })),
              linkUrl,
              linkText,
              sessionName: sessionToUse
            })
          })

          if (!response.ok) throw new Error('Gönderim başarısız')
        } else {
          // Yoncu API veya tek medya
          await sendSingleMessage(
            finalPhone,
            finalMessage,
            name !== 'Değerli Müşterimiz' ? name : undefined,
            mediaItems[0] || undefined,
            sessionToUse
          )
        }
        
        // Başarılı gönderim - Veritabanına kaydet
        try {
          await fetch('/api/message-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: finalPhone,
              message: finalMessage,
              contact_name: isGroup ? name : (name !== 'Değerli Müşterimiz' ? `${name} ${surname}`.trim() : undefined),
              status: 'sent',
              channel: channel === 'wa-web' ? 'whatsapp-web' : 'yoncu'
            })
          })
        } catch (dbError) {
          console.error('Mesaj geçmişi kaydedilemedi:', dbError)
          // Database hatası gönderimi engellemesin
        }
        
        successCount++
        messagesSinceLastBreak++
        
        // Mola kontrolü - Her X mesajdan sonra Y dakika mola
        if (messagesSinceLastBreak >= breakInt && i < phonesToSendInRange.length - 1) {
          const breakMinutes = breakDur
          const breakSeconds = breakMinutes * 60
          
          toast({
            title: 'Mola Zamanı',
            description: `${breakMinutes} dakika mola veriliyor... (${i + 1}/${totalToSend} gönderildi)`,
          })
          
          console.log(`[Toplu Gönderim] ${breakMinutes} dakika mola veriliyor... (${messagesSinceLastBreak} mesaj gönderildi)`)
          
          // Mola süresince progress güncelle (her saniye)
          const breakStartTime = Date.now()
          const breakEndTime = breakStartTime + (breakSeconds * 1000)
          
          while (Date.now() < breakEndTime) {
            const remainingSeconds = Math.ceil((breakEndTime - Date.now()) / 1000)
            const remainingMinutes = Math.floor(remainingSeconds / 60)
            const remainingSecs = remainingSeconds % 60
            
            // Progress'i güncelle (mola mesajı ile)
            setProgress({ 
              current: i + 1, 
              total: totalToSend,
              successCount,
              failCount,
              breakMessage: `Mola: ${remainingMinutes}:${remainingSecs.toString().padStart(2, '0')} kaldı`
            })
            
            await delay(1000) // 1 saniye bekle
          }
          
          // Mola bitti, breakMessage'ı temizle
          setProgress({ 
            current: i + 1, 
            total: totalToSend,
            successCount,
            failCount
          })
          
          messagesSinceLastBreak = 0 // Sayaç sıfırla
          
          toast({
            title: 'Mola Bitti',
            description: 'Gönderime devam ediliyor...',
          })
        }
        
        // Delay between messages (ayarlanabilir - rate limit için)
        if (i < phonesToSendInRange.length - 1) {
          // Mesajlar arası bekleme sırasında saat kontrolü yap
          if (scheduleEnabled) {
            const delayStart = Date.now()
            const delayMs = msgDelay * 1000
            
            // Bekleme süresini küçük parçalara böl ve her parçada saat kontrolü yap
            const checkInterval = 5000 // 5 saniyede bir kontrol et
            let elapsed = 0
            
            while (elapsed < delayMs) {
              if (isStopped) break
              
              const timeCheck = checkTimeRange()
              if (!timeCheck.inRange) {
                toast({
                  title: 'Saat Planlaması',
                  description: `${timeCheck.message}\n\nGönderim durduruldu. ${successCount} mesaj gönderildi.`,
                  variant: 'default',
                })
                break
              }
              
              const waitTime = Math.min(checkInterval, delayMs - elapsed)
              await delay(waitTime)
              elapsed += waitTime
            }
            
            // Eğer saat kontrolü nedeniyle durdurulduysa döngüden çık
            const finalTimeCheck = checkTimeRange()
            if (!finalTimeCheck.inRange) {
              break
            }
          } else {
            await delay(msgDelay * 1000) // Saniye cinsinden milisaniyeye çevir
          }
        }
      } catch (error) {
        failCount++
        console.error(`Failed to send to ${phone}:`, error)
        
        // Başarısız gönderim - Veritabanına kaydet
        try {
          await fetch('/api/message-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: finalPhone,
              message: finalMessage,
              contact_name: isGroup ? name : (name !== 'Değerli Müşterimiz' ? `${name} ${surname}`.trim() : undefined),
              status: 'failed',
              channel: channel === 'wa-web' ? 'whatsapp-web' : 'yoncu',
              error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            })
          })
        } catch (dbError) {
          console.error('Hata kaydı yapılamadı:', dbError)
        }
      }
      
      setProgress({ 
        current: i + 1, 
        total: totalToSend, 
        successCount, 
        failCount 
      })
    }

    setSending(false)
    setIsStopped(false)
    setProgress({ current: 0, total: 0, breakMessage: undefined })

    if (!isStopped) {
      toast({
        title: 'Gönderim Tamamlandı!',
        description: `${successCount} başarılı, ${failCount} başarısız.`,
      })
    }

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

      {/* Multi-Session Selection (WhatsApp Web only) */}
      {channel === 'wa-web' && availableSessions.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">WhatsApp Hesabı Seçimi</CardTitle>
                <CardDescription>
                  Hangi WhatsApp hesabından gönderim yapılacak?
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="use-multi-session"
                  checked={useMultiSession}
                  onCheckedChange={(checked) => setUseMultiSession(checked as boolean)}
                />
                <Label htmlFor="use-multi-session" className="text-sm cursor-pointer">
                  Paralel Gönder
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedSessions.includes(session.session_name)
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => {
                    if (useMultiSession) {
                      // Çoklu seçim modu
                      setSelectedSessions(prev =>
                        prev.includes(session.session_name)
                          ? prev.filter(s => s !== session.session_name)
                          : [...prev, session.session_name]
                      )
                    } else {
                      // Tekli seçim modu
                      setSelectedSessions([session.session_name])
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className={`h-5 w-5 ${
                        selectedSessions.includes(session.session_name)
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-semibold text-sm">{session.session_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {session.phone_number || 'Telefon bilgisi yok'}
                        </p>
                      </div>
                    </div>
                    {selectedSessions.includes(session.session_name) && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {useMultiSession && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs text-blue-700 dark:text-blue-300">
                💡 Paralel mod: Seçili hesaplardan eşit dağıtılarak gönderim yapılır
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                Kişi kaynağı seçin, kayıtlı bir kişi seçin veya telefon numarası girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Kişi Kaynağı Seçimi */}
              <div className="space-y-2">
                <Label>Kişi Kaynağı</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContactSource('manual')
                      setSelectedContact('')
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      contactSource === 'manual'
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">Manuel Kişiler</p>
                      <p className="text-xs text-muted-foreground">
                        {contacts.length} kişi
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSource('whatsapp')
                      setSelectedContact('')
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      contactSource === 'whatsapp'
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <Smartphone className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">WhatsApp Kişileri</p>
                      <p className="text-xs text-muted-foreground">
                        {waContacts.length} kişi
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Kişi Seçimi */}
              <div className="space-y-2">
                <Label>
                  {contactSource === 'manual' ? 'Manuel Kişi Seç' : 'WhatsApp Kişisi Seç'}
                </Label>
                <Select value={selectedContact} onValueChange={setSelectedContact}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kişi seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contactSource === 'manual'
                      ? contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} {contact.surname} - {contact.phone}
                          </SelectItem>
                        ))
                      : waContacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} - {contact.phone}
                          </SelectItem>
                        ))
                    }
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

              {/* Saat Planlaması */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Saat Planlaması
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="schedule-enabled-single"
                        checked={scheduleEnabled}
                        onCheckedChange={(checked) => setScheduleEnabled(checked === true)}
                      />
                      <Label htmlFor="schedule-enabled-single" className="text-sm cursor-pointer">
                        Aktif
                      </Label>
                    </div>
                  </div>
                  <CardDescription>
                    Mesajlar belirtilen saat aralığında gönderilecek
                  </CardDescription>
                </CardHeader>
                {scheduleEnabled && (
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="start-time-single">Başlangıç Saati</Label>
                        <Input
                          id="start-time-single"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time-single">Bitiş Saati</Label>
                        <Input
                          id="end-time-single"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 Mesajlar sadece {startTime} - {endTime} saatleri arasında gönderilecektir.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>

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
              {/* Manuel Grup Seçimi */}
              {groups.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Manuel Grup Seç</Label>
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
                      <SelectValue placeholder="Manuel grup seçin..." />
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

              {/* WhatsApp Grup Seçimi */}
              {waGroups.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>WhatsApp Grup Seç</Label>
                    {selectedWaGroup && selectedWaGroup !== 'none' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWaGroup('none')}
                        className="h-auto py-1 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        WA Grup Seçimini Kaldır
                      </Button>
                    )}
                  </div>
                  <Select value={selectedWaGroup} onValueChange={setSelectedWaGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="WhatsApp grubu seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {waGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.participantCount || 0} üye)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWaGroup && selectedWaGroup !== 'none' && (
                    <p className="text-xs text-muted-foreground">
                      ✅ WhatsApp grubu seçildi - mesaj gruba gönderilecek
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

          {/* Toplu Gönderim Ayarları */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚙️</span>
                Toplu Gönderim Ayarları
              </CardTitle>
              <CardDescription>
                Gönderim aralığı ve mola ayarlarını yapılandırın (Ban önleme için)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toplam Kişi Sayısı - Dinamik Hesaplama */}
              {(() => {
                const totalCount = calculateTotalCount()
                const start = parseInt(startIndex) || 0
                const end = endIndex ? parseInt(endIndex) : totalCount
                const rangeCount = end - start
                
                return totalCount > 0 ? (
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-primary">Toplam Kişi Sayısı</p>
                        <p className="text-2xl font-bold mt-1">{totalCount} kişi</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {endIndex 
                            ? `${start}-${end} arası (${rangeCount} kişi) gönderilecek`
                            : `Tümü (${totalCount} kişi) gönderilecek`}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                ) : null
              })()}

              {/* Gönderim Aralığı */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">📊 Gönderim Aralığı</Label>
                <p className="text-xs text-muted-foreground">
                  Hangi aralıktaki kişilere gönderileceğini belirleyin (örnek: 0-500, 500-1000)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="start-index">Başlangıç Index</Label>
                    <Input
                      id="start-index"
                      type="number"
                      min="0"
                      value={startIndex}
                      onChange={(e) => setStartIndex(e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">İlk gönderilecek kişi (0&apos;dan başlar)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-index">Bitiş Index</Label>
                    <Input
                      id="end-index"
                      type="number"
                      min="1"
                      value={endIndex}
                      onChange={(e) => setEndIndex(e.target.value)}
                      placeholder="Tümü"
                    />
                    <p className="text-xs text-muted-foreground">Son gönderilecek kişi (boş = tümü)</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 <strong>Örnek:</strong> 1000 kişi varsa, ilk gün 0-500, ertesi gün 500-1000 yazabilirsiniz.
                  </p>
                </div>
              </div>

              {/* Mola Ayarları */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">⏸️ Mola Ayarları (Ban Önleme)</Label>
                <p className="text-xs text-muted-foreground">
                  Her X mesajdan sonra Y dakika mola vererek ban riskini azaltın
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="break-interval">Kaç Mesajdan Sonra Mola?</Label>
                    <Input
                      id="break-interval"
                      type="number"
                      min="1"
                      max="1000"
                      value={breakInterval}
                      onChange={(e) => setBreakInterval(e.target.value)}
                      placeholder="50"
                    />
                    <p className="text-xs text-muted-foreground">Örnek: 50 (her 50 mesajdan sonra mola)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="break-duration">Mola Süresi (Dakika)</Label>
                    <Input
                      id="break-duration"
                      type="number"
                      min="10"
                      max="60"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(e.target.value)}
                      placeholder="10"
                    />
                    <p className="text-xs text-muted-foreground">10-60 dakika arası (ban önleme için)</p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ <strong>Önemli:</strong> Her {breakInterval || 50} mesajdan sonra {breakDuration || 10} dakika mola verilecektir. 
                    Bu, WhatsApp ban riskini azaltır.
                  </p>
                </div>
              </div>

              {/* Mesajlar Arası Bekleme */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">⏱️ Mesajlar Arası Bekleme</Label>
                <p className="text-xs text-muted-foreground">
                  Her mesaj arasında kaç saniye beklenileceğini belirleyin (rate limit için)
                </p>
                <div className="space-y-2">
                  <Label htmlFor="message-delay">Bekleme Süresi (Saniye)</Label>
                  <Input
                    id="message-delay"
                    type="number"
                    min="0"
                    max="60"
                    value={messageDelay}
                    onChange={(e) => setMessageDelay(e.target.value)}
                    placeholder="2"
                  />
                  <p className="text-xs text-muted-foreground">0-60 saniye arası (0 = bekleme yok, önerilen: 2-5 saniye)</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    💡 <strong>Öneri:</strong> Her mesaj arasında {messageDelay || 2} saniye beklenilecek. 
                    Bu, WhatsApp&apos;ın rate limit&apos;ini aşmamak için önemlidir.
                  </p>
                </div>
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
                <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-semibold mb-1">
                        <span>📊 İlerleme</span>
                        <span>{progress.current} / {progress.total}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 mb-2">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>%{Math.round((progress.current / progress.total) * 100)} tamamlandı</span>
                        <span>
                          {progress.total - progress.current > 0 
                            ? `~${Math.round((progress.total - progress.current) * 2 / 60)} dakika kaldı`
                            : 'Tamamlanıyor...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Başarı/Hata İstatistikleri */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Kalan</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {progress.total - progress.current}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Başarılı</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {progress.successCount || 0}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Başarısız</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {progress.failCount || 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Şu anda gönderilen numara */}
                  {progress.currentPhone && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Şu anda gönderiliyor:</div>
                      <div className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded">
                        📱 {progress.currentPhone}
                      </div>
                    </div>
                  )}
                  
                  {progress.breakMessage && (
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
                      <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                        ⏸️ {progress.breakMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Saat Planlaması */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Saat Planlaması
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="schedule-enabled-multiple"
                        checked={scheduleEnabled}
                        onCheckedChange={(checked) => setScheduleEnabled(checked === true)}
                      />
                      <Label htmlFor="schedule-enabled-multiple" className="text-sm cursor-pointer">
                        Aktif
                      </Label>
                    </div>
                  </div>
                  <CardDescription>
                    Mesajlar belirtilen saat aralığında gönderilecek
                  </CardDescription>
                </CardHeader>
                {scheduleEnabled && (
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="start-time-multiple">Başlangıç Saati</Label>
                        <Input
                          id="start-time-multiple"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time-multiple">Bitiş Saati</Label>
                        <Input
                          id="end-time-multiple"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 Mesajlar sadece {startTime} - {endTime} saatleri arasında gönderilecektir. 
                        Bitiş saatine yaklaşıldığında gönderim otomatik durdurulacaktır.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={handleMultipleSend}
                  disabled={sending || uploading}
                  className="flex-1"
                  size="lg"
                >
                  {uploading
                    ? 'Dosya Yükleniyor...'
                    : sending
                    ? `Gönderiliyor... (${progress.current}/${progress.total})`
                    : 'Toplu Gönder'}
                </Button>
                {sending && (
                  <Button
                    onClick={() => {
                      setIsStopped(true)
                      toast({
                        title: 'Durduruluyor...',
                        description: 'Gönderim durduruluyor, lütfen bekleyin...',
                      })
                    }}
                    variant="destructive"
                    size="lg"
                    className="min-w-[120px]"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Durdur
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

