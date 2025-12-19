'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Download
} from 'lucide-react'
import { Campaign, SendJob } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CampaignReportPage() {
  const params = useParams()
  const { toast } = useToast()
  const campaignId = params.id as string

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Rapor verilerini getir
  const fetchReport = async () => {
    setLoading(true)
    try {
      console.log('[Frontend] Rapor alınıyor, campaignId:', campaignId)
      const res = await fetch(`/api/campaigns/${campaignId}/report`)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('[Frontend] Rapor API hatası:', res.status, errorText)
        throw new Error(`Rapor alınamadı: ${res.status} ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log('[Frontend] Rapor verisi alındı:', data)

      if (data.success) {
        setReport(data.report)
      } else {
        toast({
          title: 'Hata',
          description: data.error || 'Rapor alınamadı',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.error('[Frontend] Rapor hatası:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Rapor yüklenirken bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // CSV Export
  const handleExportCSV = () => {
    if (!report || !report.jobs) return

    const csvHeader = 'Alıcı,Telefon,Durum,Hata,Gönderim Zamanı\n'
    const csvRows = report.jobs.map((job: SendJob) => {
      return `"${job.recipient_name || ''}","${job.recipient_phone}","${job.status}","${job.last_error || ''}","${job.sent_at || ''}"`
    }).join('\n')

    const csv = csvHeader + csvRows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kampanya-rapor-${campaignId}.csv`
    link.click()

    toast({
      title: 'Başarılı',
      description: 'Rapor CSV olarak indirildi'
    })
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Gönderildi</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Başarısız</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>
      case 'blocked':
        return <Badge variant="destructive">Engellendi</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  useEffect(() => {
    if (campaignId) {
      fetchReport()
      // Her 10 saniyede bir raporu yenile
      const interval = setInterval(fetchReport, 10000)
      return () => clearInterval(interval)
    }
  }, [campaignId])

  if (loading && !report) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6">
        <p>Rapor bulunamadı</p>
      </div>
    )
  }

  const { campaign, summary, jobs, errors } = report

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground mt-1">
              Kampanya Raporu
            </p>
          </div>
        </div>

        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          CSV İndir
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Toplam</p>
              <p className="text-3xl font-bold">{summary.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Başarılı</p>
              <p className="text-3xl font-bold text-green-600">{summary.sent}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Başarısız</p>
              <p className="text-3xl font-bold text-red-600">{summary.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bekliyor</p>
              <p className="text-3xl font-bold text-yellow-600">{summary.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground">Başarı Oranı</p>
            <p className="text-3xl font-bold">{summary.success_rate.toFixed(1)}%</p>
          </div>
        </Card>
      </div>

      {/* Hata İstatistikleri */}
      {errors && errors.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Hata Analizi</h3>
          <div className="space-y-2">
            {errors.map((error: any, index: number) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <p className="text-sm flex-1">{error.error}</p>
                <Badge variant="destructive">{error.count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Job Listesi */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Gönderim Detayları ({jobs.length})</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {jobs.map((job: SendJob) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">{job.recipient_name || 'İsimsiz'}</p>
                <p className="text-sm text-muted-foreground">{job.recipient_phone}</p>
                {job.last_error && (
                  <p className="text-xs text-red-600 mt-1">{job.last_error}</p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {job.sent_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(job.sent_at).toLocaleString('tr-TR')}
                  </p>
                )}
                {getStatusBadge(job.status)}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}

