'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react'
import { Campaign } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ReportsPage() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // Kampanyaları getir
  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()

      if (data.success) {
        setCampaigns(data.campaigns || [])
      } else {
        toast({
          title: 'Hata',
          description: data.error || 'Kampanyalar yüklenemedi',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.error('[Frontend] Kampanyalar yükleme hatası:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Kampanyalar yüklenirken bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Tamamlandı</Badge>
      case 'running':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Çalışıyor</Badge>
      case 'paused':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Duraklatıldı</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Başarısız</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Başarı oranı hesapla
  const getSuccessRate = (campaign: Campaign) => {
    const total = campaign.sent_count + campaign.failed_count
    if (total === 0) return 0
    return Math.round((campaign.sent_count / total) * 100)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Kampanya Raporları
          </h1>
          <p className="text-muted-foreground mt-1">
            Tüm kampanyaların detaylı raporlarını görüntüleyin
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Henüz kampanya yok</h3>
          <p className="text-muted-foreground mb-6">
            İlk kampanyanızı oluşturarak başlayın
          </p>
          <Link href="/dashboard/campaigns">
            <Button>
              Kampanyalar Sayfasına Git
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Başlık ve Durum */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {campaign.message_template?.substring(0, 50) || 'Mesaj şablonu yok'}...
                      </p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  {/* İstatistikler */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Toplam Gönderim:</span>
                      <span className="font-semibold">
                        {campaign.sent_count + campaign.failed_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Başarılı:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {campaign.sent_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600 dark:text-red-400">Başarısız:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {campaign.failed_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Başarı Oranı:</span>
                      <span className="font-bold text-primary">
                        %{getSuccessRate(campaign)}
                      </span>
                    </div>
                  </div>

                  {/* Tarih */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p>
                      Oluşturulma: {new Date(campaign.created_at).toLocaleDateString('tr-TR')}
                    </p>
                    {campaign.updated_at && (
                      <p>
                        Güncelleme: {new Date(campaign.updated_at).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>

                  {/* Detaylı Rapor Butonu */}
                  <Link href={`/dashboard/reports/${campaign.id}`}>
                    <Button className="w-full" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Detaylı Raporu Görüntüle
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}







