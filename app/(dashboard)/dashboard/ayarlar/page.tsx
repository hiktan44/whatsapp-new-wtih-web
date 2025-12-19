'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Settings as SettingsIcon, Key, User, CheckCircle2, XCircle, Loader2, Globe, Copy } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const { toast } = useToast()
  const [serviceId, setServiceId] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [publicIp, setPublicIp] = useState<string>('')
  const [ipLoading, setIpLoading] = useState(true)
  const [serviceStatus, setServiceStatus] = useState<{
    status: 'active' | 'inactive' | 'unknown'
    message: string
  }>({ status: 'unknown', message: '' })

  useEffect(() => {
    fetchSettings()
    fetchPublicIp()
  }, [])

  const fetchPublicIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setPublicIp(data.ip)
    } catch (error) {
      console.error('IP fetch error:', error)
      setPublicIp('Alınamadı')
    } finally {
      setIpLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Kopyalandı!',
        description: 'IP adresi panoya kopyalandı.',
      })
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Kopyalama başarısız oldu.',
        variant: 'destructive',
      })
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setServiceId(data.service_id || '')
          setAuthToken(data.auth_token || '')
        }
      }
    } catch (error) {
      console.error('Fetch settings error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiSettings = async () => {
    if (!serviceId || !authToken) {
      toast({
        title: 'Hata!',
        description: 'Tüm alanları doldurun.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          auth_token: authToken,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: 'API ayarları kaydedildi.',
        })
      } else {
        throw new Error('Kaydetme başarısız')
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Ayarlar kaydedilirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!serviceId || !authToken) {
      toast({
        title: 'Hata!',
        description: 'Önce API ayarlarını kaydedin.',
        variant: 'destructive',
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/yoncu/status')
      if (response.ok) {
        const data = await response.json()
        const isActive = data.isActive || data.status === "1" || data.status === 1
        setServiceStatus({
          status: isActive ? 'active' : 'inactive',
          message: data.message,
        })
        toast({
          title: isActive ? 'Başarılı!' : 'Uyarı!',
          description: data.message,
          variant: isActive ? 'default' : 'destructive',
        })
      } else {
        const data = await response.json()
        setServiceStatus({
          status: 'inactive',
          message: data.error || 'Bağlantı başarısız',
        })
        toast({
          title: 'Hata!',
          description: data.error || 'Bağlantı test edilemedi.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      setServiceStatus({
        status: 'inactive',
        message: error.message || 'Bağlantı hatası',
      })
      toast({
        title: 'Hata!',
        description: 'Bağlantı test edilirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setTesting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!username && !password) {
      toast({
        title: 'Hata!',
        description: 'En az bir alan doldurulmalı.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username || undefined,
          password: password || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: 'Kullanıcı bilgileri güncellendi.',
        })
        setUsername('')
        setPassword('')

        // Login kaldırıldı: kullanıcı adı değiştiyse sayfayı yenilemek yeterli.
        if (username) {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        throw new Error('Güncelleme başarısız')
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Kullanıcı bilgileri güncellenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">
          API ve kullanıcı ayarlarını yönetin
        </p>
      </div>

      {/* API Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Ayarları
            </CardTitle>
            <CardDescription>
              Yoncu API bağlantı bilgilerinizi yapılandırın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Service ID</Label>
              <Input
                id="serviceId"
                placeholder="Service ID girin"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authToken">Authorization Token</Label>
              <Input
                id="authToken"
                placeholder="Authorization token girin"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Format: Basic MTA2MjYzOmRiNDQ1M2YyYjIyZDM4MzA4NDY1MDgyNjI4NGM4ZmQ4MWY1OTE3YjQ=
              </p>
            </div>

            {serviceStatus.status !== 'unknown' && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  serviceStatus.status === 'active'
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}
              >
                {serviceStatus.status === 'active' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">{serviceStatus.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSaveApiSettings}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button
                onClick={handleTestConnection}
                disabled={testing}
                variant="outline"
                className="flex-1"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Test Ediliyor...
                  </>
                ) : (
                  'Bağlantıyı Test Et'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kullanıcı Bilgileri
            </CardTitle>
            <CardDescription>
              Kullanıcı adı ve şifrenizi değiştirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Yeni Kullanıcı Adı</Label>
              <Input
                id="username"
                placeholder="Yeni kullanıcı adı (opsiyonel)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kullanıcı adını değiştirirseniz tekrar giriş yapmanız gerekecek
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Yeni Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Yeni şifre (opsiyonel)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Şifre düz metin olarak saklanır
              </p>
            </div>

            <Button
              onClick={handleUpdateUser}
              disabled={saving || (!username && !password)}
              className="w-full"
            >
              {saving ? 'Güncelleniyor...' : 'Kullanıcı Bilgilerini Güncelle'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Public IP Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Public IP Adresiniz
            </CardTitle>
            <CardDescription>
              İnternete çıktığınız IP adresi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ipLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                IP adresi alınıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-lg">
                  {publicIp}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(publicIp)}
                  disabled={publicIp === 'Alınamadı'}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Bu IP adresini API whitelist ayarlarında kullanabilirsiniz
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">ℹ️ Bilgi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • API ayarlarınızı Yoncu panel&apos;inizden alabilirsiniz
            </p>
            <p>
              • Bağlantı testi, servisinizin aktif olup olmadığını kontrol eder
            </p>
            <p>
              • Kullanıcı bilgilerinizi güvenli bir şekilde saklayın
            </p>
            <p>
              • Public IP adresinizi API whitelist ayarlarında kullanabilirsiniz
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

