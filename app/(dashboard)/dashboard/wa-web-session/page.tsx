'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Smartphone, QrCode, CheckCircle2, XCircle, Loader2, Send, Users, UsersRound, Download } from 'lucide-react'

export default function WaWebSessionPage() {
  const { toast } = useToast()
  const [connected, setConnected] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
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
          // QR kod zaten varsa tekrar set etme (gereksiz re-render önleme)
          if (qrCode !== data.qrCode) {
            setQrCode(data.qrCode)
            console.log('[Frontend] QR kod alındı')
          }
        } else if (data.connected) {
          setQrCode(null)
          console.log('[Frontend] Bağlantı kuruldu!')
        }

        // Bağlandıysa polling'i durdur
        if (data.connected && pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
          toast({ 
            title: 'Bağlantı Kuruldu!', 
            description: `WhatsApp bağlantısı başarıyla kuruldu. Telefon: ${data.phone ? '+' + data.phone : 'Bilinmiyor'}` 
          })
        }
      } else {
        console.error('[Frontend] Status API hatası:', data.error)
      }
    } catch (error) {
      console.error('[Frontend] Status hatası:', error)
    }
  }

  // Temizle ve yeniden bağlan
  const handleCleanupAndConnect = async () => {
    setLoading(true)
    setQrCode(null)
    setConnected(false)

    try {
      // Önce logout yap (temizlik için)
      console.log('[Frontend] Temizlik yapılıyor...')
      try {
        await fetch('/api/wa-web/logout', { method: 'POST' })
      } catch (e) {
        // Logout hatası önemli değil
      }

      // 1 saniye bekle (temizlik için)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Sonra bağlan
      await handleConnect()
    } catch (error: any) {
      toast({ title: 'Hata', description: error.message || 'Temizlik yapılamadı', variant: 'destructive' })
      console.error('[Frontend] Temizlik hatası:', error)
      setLoading(false)
    }
  }

  // Bağlan
  const handleConnect = async () => {
    setLoading(true)
    setQrCode(null)
    setConnected(false)

    try {
      console.log('[Frontend] Bağlantı isteği gönderiliyor...')
      const res = await fetch('/api/wa-web/connect', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Bağlantı başlatıldı', description: 'QR kodu bekleniyor...' })
        console.log('[Frontend] Bağlantı başlatıldı, QR kod bekleniyor...')

        // Hemen bir kez kontrol et (500ms sonra)
        setTimeout(() => {
          checkStatus()
        }, 500)

        // Polling başlat (2 saniye aralıkla - QR kod görününce daha yavaş)
        if (pollRef.current) clearInterval(pollRef.current)
        pollRef.current = setInterval(checkStatus, 2000)

        // 3 dakika sonra polling'i durdur
        setTimeout(() => {
          if (pollRef.current && !connected) {
            clearInterval(pollRef.current)
            pollRef.current = null
            toast({ title: 'Zaman aşımı', description: 'Bağlantı kurulamadı. Lütfen tekrar deneyin.', variant: 'destructive' })
          }
        }, 180000)
      } else {
        const errorMsg = data.error || 'Bağlantı kurulamadı';
        
        // Özel hata mesajları
        if (errorMsg.includes('IndexedDB') || errorMsg.includes('backing store')) {
          toast({ 
            title: 'IndexedDB Hatası', 
            description: 'Chrome veri deposu hatası. Lütfen "Temizle ve Yeniden Bağlan" butonunu kullanın.', 
            variant: 'destructive' 
          });
        } else if (errorMsg.includes('Protocol error') || errorMsg.includes('Execution context was destroyed')) {
          toast({ 
            title: 'Chrome Bağlantı Hatası', 
            description: 'Chrome başlatılamadı. Lütfen "Temizle ve Yeniden Bağlan" butonunu kullanın. Chrome penceresini kapatıp tekrar deneyin.', 
            variant: 'destructive' 
          });
        } else if (errorMsg.includes('Chrome bulunamadı')) {
          toast({ 
            title: 'Chrome Bulunamadı', 
            description: 'Google Chrome yüklü değil veya bulunamıyor. Lütfen Chrome\'u yükleyin.', 
            variant: 'destructive' 
          });
        } else {
          toast({ title: 'Hata', description: errorMsg, variant: 'destructive' });
        }
        
        console.error('[Frontend] Bağlantı hatası:', data.error);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Bağlantı kurulamadı';
      
      // Özel hata mesajları
      if (errorMsg.includes('IndexedDB') || errorMsg.includes('backing store')) {
        toast({ 
          title: 'IndexedDB Hatası', 
          description: 'Chrome veri deposu hatası. Lütfen "Temizle ve Yeniden Bağlan" butonunu kullanın.', 
          variant: 'destructive' 
        });
      } else if (errorMsg.includes('Protocol error') || errorMsg.includes('Execution context was destroyed')) {
        toast({ 
          title: 'Chrome Bağlantı Hatası', 
          description: 'Chrome başlatılamadı. Lütfen "Temizle ve Yeniden Bağlan" butonunu kullanın.', 
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Hata', description: errorMsg, variant: 'destructive' });
      }
      
      console.error('[Frontend] Bağlantı exception:', error);
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

  // Kişileri senkronize et
  const handleSyncContacts = async () => {
    if (!connected) {
      toast({ 
        title: 'Hata', 
        description: 'WhatsApp bağlı değil. Lütfen önce bağlantı kurun.', 
        variant: 'destructive' 
      })
      return
    }

    setSyncing(true)
    try {
      console.log('[Frontend] Kişiler çekiliyor...')
      const res = await fetch('/api/wa-web/sync-contacts', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        toast({ 
          title: 'Başarılı!', 
          description: `${data.stats.added} yeni kişi eklendi, ${data.stats.updated} kişi güncellendi. Toplam: ${data.stats.total} kişi işlendi.` 
        })
        console.log('[Frontend] Kişiler başarıyla çekildi:', data.stats)
      } else {
        console.error('[Frontend] Kişiler çekme hatası:', data.error)
        toast({ 
          title: 'Hata', 
          description: data.error || 'Kişiler çekilemedi', 
          variant: 'destructive' 
        })
      }
    } catch (error: any) {
      console.error('[Frontend] Kişiler çekme hatası:', error)
      toast({ 
        title: 'Hata', 
        description: error.message || 'Kişiler çekilirken bir hata oluştu', 
        variant: 'destructive' 
      })
    } finally {
      setSyncing(false)
    }
  }

  // Grupları senkronize et
  const handleSyncGroups = async () => {
    if (!connected) {
      toast({ 
        title: 'Hata', 
        description: 'WhatsApp bağlı değil. Lütfen önce bağlantı kurun.', 
        variant: 'destructive' 
      })
      return
    }

    setSyncing(true)
    try {
      console.log('[Frontend] Gruplar çekiliyor...')
      const res = await fetch('/api/wa-web/sync-groups', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        toast({ 
          title: 'Başarılı!', 
          description: `${data.stats.addedGroups} yeni grup, ${data.stats.updatedGroups} grup güncellendi, ${data.stats.addedContacts} yeni kişi, ${data.stats.addedGroupMembers} grup üyesi eklendi. Toplam: ${data.stats.totalGroups} grup işlendi.` 
        })
        console.log('[Frontend] Gruplar başarıyla çekildi:', data.stats)
      } else {
        console.error('[Frontend] Gruplar çekme hatası:', data.error)
        toast({ 
          title: 'Hata', 
          description: data.error || 'Gruplar çekilemedi', 
          variant: 'destructive' 
        })
      }
    } catch (error: any) {
      console.error('[Frontend] Gruplar çekme hatası:', error)
      toast({ 
        title: 'Hata', 
        description: error.message || 'Gruplar çekilirken bir hata oluştu', 
        variant: 'destructive' 
      })
    } finally {
      setSyncing(false)
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
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              WhatsApp uygulamanızı açın → <strong>Bağlı Cihazlar</strong> → 
              <strong>Cihaz Bağla</strong> ve bu QR kodu tarayın
            </p>
            <Button
              onClick={handleConnect}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yenileniyor...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Kodu Yenile
                </>
              )}
            </Button>
          </div>
        )}

        {/* QR Kod Bekleniyor */}
        {!qrCode && !connected && loading && (
          <div className="flex flex-col items-center py-6 border-t">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              QR kodu oluşturuluyor... Lütfen bekleyin.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Chrome tarayıcısı açılacak, lütfen kapatmayın.
            </p>
          </div>
        )}

        {/* Bağlan Butonu */}
        {!connected && (
          <div className="space-y-2">
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
            <Button 
              onClick={handleCleanupAndConnect} 
              disabled={loading}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Temizleniyor...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Temizle ve Yeniden Bağlan
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Sorun yaşıyorsanız &quot;Temizle ve Yeniden Bağlan&quot; butonunu kullanın
            </p>
          </div>
        )}
      </Card>

      {/* Bağlı Durumda Yeniden Bağlan Butonu */}
      {connected && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Bağlantı Durumu</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mesaj göndermede sorun yaşıyorsanız yeniden bağlanın
              </p>
            </div>
            <Button 
              onClick={handleCleanupAndConnect} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Temizleniyor...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Temizle ve Yeniden Bağlan
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

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
                Resim, video veya dosya URL&apos;si girin. WhatsApp&apos;ta önizlemeli gözükecektir.
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

      {/* Senkronizasyon Kartı - Sadece bağlıyken göster */}
      {connected && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">WhatsApp&apos;tan Çek</h3>
              <p className="text-sm text-muted-foreground">
                Kişileri ve grupları WhatsApp&apos;tan otomatik olarak çekin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kişileri Çek */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Kişileri Çek</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                WhatsApp&apos;taki tüm kişilerinizi sisteme aktarın. Mevcut kişiler güncellenecektir.
              </p>
              <Button
                onClick={handleSyncContacts}
                disabled={syncing}
                className="w-full"
                variant="outline"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Çekiliyor...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Kişileri Çek
                  </>
                )}
              </Button>
            </div>

            {/* Grupları Çek */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <UsersRound className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Grupları Çek</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                WhatsApp gruplarını ve üyelerini çekin. Grup üyeleri otomatik olarak kişilere eklenecektir.
              </p>
              <Button
                onClick={handleSyncGroups}
                disabled={syncing}
                className="w-full"
                variant="outline"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Çekiliyor...
                  </>
                ) : (
                  <>
                    <UsersRound className="w-4 h-4 mr-2" />
                    Grupları ve Üyeleri Çek
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Bilgilendirme */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Nasıl Çalışır?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Kişileri Çek:</strong> WhatsApp&apos;taki tüm kayıtlı kişilerinizi getirir</li>
                  <li><strong>Grupları Çek:</strong> Tüm grupları ve grup üyelerini getirir</li>
                  <li><strong>Otomatik Ekleme:</strong> Grup üyesi sistemde yoksa, önce kişi olarak eklenir, sonra gruba dahil edilir</li>
                  <li><strong>Güvenli:</strong> Mevcut verileriniz korunur, sadece yeniler eklenir veya güncellenecektir</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
