'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Plus, 
  Eye, 
  Send, 
  Pause, 
  Play,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Campaign } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CampaignsPage() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    channel: 'wa_web' as 'business_api' | 'wa_web',
    message_template: '',
    target_type: 'contacts' as 'contacts' | 'groups' | 'manual',
    target_contacts: [] as string[],
    target_groups: [] as string[],
    target_manual_phones: '',
    rate_profile: 'low' as 'low' | 'medium' | 'high'
  })

  // Kampanyaları getir
  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error('Kampanyalar yüklenemedi:', error)
    }
  }

  // Yeni kampanya oluştur
  const handleCreateCampaign = async () => {
    if (!formData.name || !formData.message_template) {
      toast({
        title: 'Hata',
        description: 'Kampanya adı ve mesaj zorunludur',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      // Rate limit profilini ayarla
      let rateLimitConfig = {
        rate_limit_per_second: 1,
        rate_limit_per_minute: 20,
        delay_min_ms: 2000,
        delay_max_ms: 5000
      }

      if (formData.rate_profile === 'medium') {
        rateLimitConfig = {
          rate_limit_per_second: 2,
          rate_limit_per_minute: 60,
          delay_min_ms: 1000,
          delay_max_ms: 3000
        }
      } else if (formData.rate_profile === 'high') {
        rateLimitConfig = {
          rate_limit_per_second: 3,
          rate_limit_per_minute: 120,
          delay_min_ms: 500,
          delay_max_ms: 2000
        }
      }

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          target_manual_phones: formData.target_manual_phones
            ? formData.target_manual_phones.split('\n').filter(p => p.trim())
            : [],
          ...rateLimitConfig
        })
      })

      const data = await res.json()
      
      if (data.success) {
        toast({
          title: 'Başarılı',
          description: 'Kampanya oluşturuldu'
        })
        setDialogOpen(false)
        fetchCampaigns()
        // Formu sıfırla
        setFormData({
          name: '',
          channel: 'wa_web',
          message_template: '',
          target_type: 'contacts',
          target_contacts: [],
          target_groups: [],
          target_manual_phones: '',
          rate_profile: 'low'
        })
      } else {
        toast({
          title: 'Hata',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Taslak</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-500">Zamanlandı</Badge>
      case 'running':
        return <Badge className="bg-green-500">Çalışıyor</Badge>
      case 'paused':
        return <Badge className="bg-yellow-500">Duraklatıldı</Badge>
      case 'completed':
        return <Badge className="bg-gray-500">Tamamlandı</Badge>
      case 'failed':
        return <Badge variant="destructive">Başarısız</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kampanyalar</h1>
          <p className="text-muted-foreground mt-1">
            Toplu mesaj gönderim kampanyaları oluşturun ve yönetin
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kampanya
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Kampanya Adı */}
              <div>
                <Label htmlFor="name">Kampanya Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Yeni Ürün Tanıtımı"
                />
              </div>

              {/* Kanal Seçimi */}
              <div>
                <Label htmlFor="channel">Gönderim Kanalı</Label>
                <select
                  id="channel"
                  className="w-full p-2 border rounded-md"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                >
                  <option value="wa_web">WhatsApp Web/Desktop</option>
                  <option value="business_api">Business API (Yoncu)</option>
                </select>
              </div>

              {/* Mesaj Şablonu */}
              <div>
                <Label htmlFor="message">Mesaj Şablonu *</Label>
                <Textarea
                  id="message"
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  placeholder="Merhaba {name}, ..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Kullanılabilir değişkenler: {'{name}'}, {'{surname}'}, {'{email}'}, {'{company}'}
                </p>
              </div>

              {/* Hedef Kitle Seçimi */}
              <div>
                <Label htmlFor="target_type">Hedef Kitle</Label>
                <select
                  id="target_type"
                  className="w-full p-2 border rounded-md"
                  value={formData.target_type}
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value as any })}
                >
                  <option value="contacts">Kayıtlı Kişiler</option>
                  <option value="groups">Gruplar</option>
                  <option value="manual">Manuel Numara Listesi</option>
                </select>
              </div>

              {/* Manuel Numara Listesi */}
              {formData.target_type === 'manual' && (
                <div>
                  <Label htmlFor="manual_phones">Telefon Numaraları (Her satırda bir numara)</Label>
                  <Textarea
                    id="manual_phones"
                    value={formData.target_manual_phones}
                    onChange={(e) => setFormData({ ...formData, target_manual_phones: e.target.value })}
                    placeholder="+905XXXXXXXXX&#10;+905XXXXXXXXX&#10;..."
                    rows={8}
                  />
                </div>
              )}

              {/* Hız Profili */}
              <div>
                <Label htmlFor="rate_profile">Gönderim Hız Profili</Label>
                <select
                  id="rate_profile"
                  className="w-full p-2 border rounded-md"
                  value={formData.rate_profile}
                  onChange={(e) => setFormData({ ...formData, rate_profile: e.target.value as any })}
                >
                  <option value="low">Düşük Hız (Güvenli, Önerilen)</option>
                  <option value="medium">Orta Hız (Dikkatli Kullanın)</option>
                  <option value="high">Yüksek Hız (Riskli, Önerilmez)</option>
                </select>
              </div>

              {/* Uyarı */}
              {formData.rate_profile !== 'low' && (
                <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Yüksek hız profilleri ban riskini artırır. Dikkatli kullanın!
                    </p>
                  </div>
                </Card>
              )}

              {/* Butonlar */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    'Kampanya Oluştur'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kampanya Listesi */}
      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz kampanya yok</h3>
            <p className="text-muted-foreground mb-4">
              İlk kampanyanızı oluşturarak başlayın
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kampanya
            </Button>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                      <Badge variant="outline">
                        {campaign.channel === 'wa_web' ? 'WA Web' : 'Business API'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {campaign.message_template}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span>Toplam: {campaign.total_recipients}</span>
                      <span>Gönderilen: {campaign.sent_count}</span>
                      <span>Başarısız: {campaign.failed_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/reports/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    {campaign.status === 'draft' && (
                      <Link href={`/dashboard/campaigns/${campaign.id}/preview`}>
                        <Button size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Gönder
                        </Button>
                      </Link>
                    )}
                    
                    {campaign.status === 'running' && (
                      <Button size="sm" variant="outline">
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {campaign.status === 'paused' && (
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

