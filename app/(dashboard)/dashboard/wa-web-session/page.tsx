'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Smartphone, QrCode, CheckCircle2, XCircle, Loader2, Send } from 'lucide-react'

export default function WaWebSessionPage() {
  const { toast } = useToast()
  const [connected, setConnected] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Merhaba, bu bir test mesajıdır.')
  const [testMediaUrl, setTestMediaUrl] = useState('')
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Status kontrolü
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/wa-web/status')
      const data = await res.json()

      if (data.success) {
        setConnected(data.connected)
        setPhone(data.phone)
        
        if (data.qrCode) {
          setQrCode(data.qrCode)
        } else if (data.connected) {
          setQrCode(null)
        }

        // Bağlandıysa polling'i durdur
        if (data.connected && pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      }
    } catch (error) {
      console.error('Status hatası:', error)
    }
  }

  // Bağlan
  const handleConnect = async () => {
    setLoading(true)
    setQrCode(null)

    try {
      const res = await fetch('/api/wa-web/connect', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Bağlantı başlatıldı', description: 'QR kodu bekleniyor...' })

        // Polling başlat
        if (pollRef.current) clearInterval(pollRef.current)
        pollRef.current = setInterval(checkStatus, 1500)

        // 3 dakika sonra polling'i durdur
        setTimeout(() => {
          if (pollRef.current && !connected) {
            clearInterval(pollRef.current)
            pollRef.current = null
            toast({ title: 'Zaman aşımı', description: 'Bağlantı kurulamadı', variant: 'destructive' })
          }
        }, 180000)
      } else {
        toast({ title: 'Hata', description: data.error, variant: 'destructive' })
      }
    } catch (error: any) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Mesaj gönder
  const handleSendMessage = async () => {
    if (!testPhone || !testMessage) {
      toast({ title: 'Hata', description: 'Telefon ve mesaj gerekli', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/wa-web/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: testPhone, 
          message: testMessage,
          media: testMediaUrl || undefined
        })
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Başarılı', description: 'Mesaj gönderildi! ID: ' + data.messageId })
      } else {
        toast({ title: 'Hata', description: data.error, variant: 'destructive' })
      }
    } catch (error: any) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // İlk yüklemede status kontrol et
  useEffect(() => {
    checkStatus()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">WhatsApp Web Oturumu</h1>
        <p className="text-muted-foreground mt-1">
          WhatsApp Web ile bağlantı kurun ve mesaj gönderin
        </p>
      </div>

      {/* Durum Kartı */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              connected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Smartphone className={`w-6 h-6 ${connected ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold">
                {connected ? 'Bağlı' : 'Bağlı Değil'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {phone ? `+${phone}` : 'Telefon bağlı değil'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {connected ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>

        {/* QR Kodu */}
        {qrCode && !connected && (
          <div className="flex flex-col items-center py-6 border-t">
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              WhatsApp uygulamanızı açın → <strong>Bağlı Cihazlar</strong> → 
              <strong>Cihaz Bağla</strong> ve bu QR kodu tarayın
            </p>
          </div>
        )}

        {/* Bağlan Butonu */}
        {!connected && (
          <Button 
            onClick={handleConnect} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bağlanıyor...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Bağlan
              </>
            )}
          </Button>
        )}
      </Card>

      {/* Mesaj Gönderme Kartı - Sadece bağlıyken göster */}
      {connected && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Test Mesajı Gönder</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Telefon Numarası</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="905xxxxxxxxx"
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Başında 90 ile yazın, örn: 905321234567
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Mesaj</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Medya URL (Opsiyonel)</label>
              <input
                type="text"
                value={testMediaUrl}
                onChange={(e) => setTestMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Resim, video veya dosya URL'si girin. WhatsApp'ta önizlemeli gözükecektir.
              </p>
            </div>

            <Button 
              onClick={handleSendMessage}
              disabled={loading || !testPhone || !testMessage}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {testMediaUrl ? 'Medya ile Gönder' : 'Mesaj Gönder'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
