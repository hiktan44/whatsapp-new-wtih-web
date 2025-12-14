'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Eye
} from 'lucide-react'
import { Campaign, CampaignPreview } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CampaignPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [previews, setPreviews] = useState<CampaignPreview[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [compliance, setCompliance] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)

  // Preview verilerini getir
  const fetchPreview = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/preview`, {
        method: 'POST'
      })
      const data = await res.json()

      if (data.success) {
        setPreviews(data.previews)
        setSummary(data.summary)
        setCompliance(data.compliance)
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

  // Kampanyayı başlat
  const handleSend = async () => {
    if (!consentChecked) {
      toast({
        title: 'Uyarı',
        description: 'Devam etmek için onay kutusunu işaretlemelisiniz',
        variant: 'destructive'
      })
      return
    }

    if (!compliance?.passed) {
      toast({
        title: 'Uyarı',
        description: 'Uyum kontrolleri başarısız. Devam edilemiyor.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST'
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Başarılı',
          description: data.message
        })
        router.push(`/dashboard/reports/${campaignId}`)
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

  useEffect(() => {
    if (campaignId) {
      fetchPreview()
    }
  }, [campaignId])

  if (loading && !previews.length) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/campaigns">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Kampanya Ön İzleme</h1>
          <p className="text-muted-foreground mt-1">
            Göndermeden önce mesajları kontrol edin
          </p>
        </div>
      </div>

      {/* Özet Bilgiler */}
      {summary && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Kampanya Özeti</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Toplam Alıcı</p>
              <p className="text-2xl font-bold">{summary.total_recipients}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Medya</p>
              <p className="text-2xl font-bold">{summary.has_media ? 'Evet' : 'Hayır'}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Tahmini Süre</p>
              <p className="text-2xl font-bold">{summary.estimated_duration_minutes} dk</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Ön İzleme</p>
              <p className="text-2xl font-bold">{summary.previews_shown}/{summary.total_recipients}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Uyum Kontrolleri */}
      {compliance && (
        <Card className={`p-6 ${compliance.passed ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-center space-x-3 mb-4">
            {compliance.passed ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-500" />
            )}
            <h3 className="font-semibold">Uyum Kontrolleri</h3>
            <Badge variant={compliance.passed ? 'default' : 'destructive'}>
              {compliance.passed ? 'Başarılı' : 'Başarısız'}
            </Badge>
          </div>

          {/* Hatalar */}
          {compliance.errors && compliance.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Hatalar:</h4>
              <ul className="list-disc list-inside space-y-1">
                {compliance.errors.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Uyarılar */}
          {compliance.warnings && compliance.warnings.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">Uyarılar:</h4>
              <ul className="list-disc list-inside space-y-1">
                {compliance.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Mesaj Ön İzlemeleri */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Mesaj Ön İzlemeleri</h3>
        <div className="space-y-4">
          {previews.map((preview, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{preview.recipient_name || 'İsimsiz'}</p>
                  <p className="text-sm text-muted-foreground">{preview.recipient_phone}</p>
                </div>
                {preview.media_url && (
                  <Badge variant="secondary">
                    <Eye className="w-3 h-3 mr-1" />
                    Medya var
                  </Badge>
                )}
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-sm whitespace-pre-wrap">
                {preview.rendered_message}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Onay ve Gönderim */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="consent" 
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="consent" className="text-sm font-medium cursor-pointer">
                Onaylıyorum
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Bu listedeki tüm alıcıların açık rızası (opt-in) olduğunu, 
                WhatsApp kullanım şartlarına uygun davrandığımı ve 
                ban riskini kabul ettiğimi onaylıyorum.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link href="/dashboard/campaigns">
              <Button variant="outline">
                İptal
              </Button>
            </Link>
            <Button 
              onClick={handleSend}
              disabled={loading || !consentChecked || !compliance?.passed}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kampanyayı Başlat
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

