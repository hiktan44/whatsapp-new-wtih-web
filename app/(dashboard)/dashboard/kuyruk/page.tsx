'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { RefreshCw, Clock, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

interface QueueData {
  count: number
  phones: string[]
}

export default function QueuePage() {
  const { toast } = useToast()
  const [queueData, setQueueData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const fetchingRef = useRef(false) // Aynı anda birden fazla istek engellemek için

  const fetchQueue = async (showToast = false) => {
    // Eğer zaten bir istek yapılıyorsa, yeni istek yapma
    if (fetchingRef.current) {
      console.log('Already fetching, skipping...')
      return
    }

    fetchingRef.current = true
    setRefreshing(true)
    
    try {
      const response = await fetch('/api/yoncu/queue', {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        setQueueData({
          count: data.count,
          phones: data.phones,
        })
        if (showToast) {
          toast({
            title: 'Güncellendi!',
            description: 'Kuyruk durumu güncellendi.',
          })
        }
      } else {
        const data = await response.json()
        if (showToast) {
          toast({
            title: 'Hata!',
            description: data.error || 'Kuyruk durumu alınamadı.',
            variant: 'destructive',
          })
        }
      }
    } catch (error: any) {
      // Sadece manuel yenileme yaparken hata göster
      if (showToast) {
        toast({
          title: 'Hata!',
          description: error.message || 'Kuyruk durumu alınırken hata oluştu.',
          variant: 'destructive',
        })
      }
      // İlk yüklemede sessizce başarısız ol
      console.error('Queue fetch error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    // Sadece bir kez çalışsın diye flag kullan
    let isMounted = true

    const initQueue = async () => {
      if (isMounted) {
        await fetchQueue()
      }
    }

    initQueue()

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        fetchQueue()
      }
    }, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kuyruk Durumu</h1>
          <p className="text-muted-foreground mt-1">
            Bekleyen mesajları görüntüleyin
          </p>
        </div>
        <Button
          onClick={() => fetchQueue(true)}
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Yükleniyor...
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Kuyruk İstatistikleri
              </CardTitle>
              <CardDescription>Anlık kuyruk durumu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-4xl font-bold text-primary">{queueData?.count || 0}</p>
                  <p className="text-sm text-muted-foreground">Bekleyen Mesaj</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR')} 
                <span className="ml-2">(Otomatik yenileme: 10 saniye)</span>
              </p>
            </CardContent>
          </Card>

          {/* Queue List */}
          {queueData && queueData.count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Bekleyen Telefon Numaraları
                </CardTitle>
                <CardDescription>
                  Kuyruktaki {queueData.phones.length} numara
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {queueData.phones.map((phone, index) => (
                    <motion.div
                      key={`${phone}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-mono text-sm">{phone}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {queueData && queueData.count === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Kuyrukta mesaj yok</p>
                  <p className="text-sm mt-2">
                    Şu anda bekleyen mesaj bulunmuyor
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

