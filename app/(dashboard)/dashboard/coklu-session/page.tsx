'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Smartphone, Plus, Trash2, QrCode, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Session {
  id: string
  session_name: string
  status: 'connected' | 'disconnected' | 'connecting' | 'qr_pending'
  qr_code?: string
  phone_number?: string
  last_connected_at?: string
}

export default function MultiSessionPage() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [newSessionName, setNewSessionName] = useState('')
  const [connecting, setConnecting] = useState<Set<string>>(new Set())

  // Session'ları yükle
  const loadSessions = async () => {
    try {
      const response = await fetch('/api/wa-web/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Session yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
    
    // Her 5 saniyede bir güncelle
    const interval = setInterval(loadSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  // Yeni session ekle
  const handleAddSession = async () => {
    if (!newSessionName.trim()) {
      toast({
        title: 'Hata',
        description: 'Session adı giriniz',
        variant: 'destructive'
      })
      return
    }

    if (sessions.length >= 5) {
      toast({
        title: 'Limit Aşıldı',
        description: 'Maksimum 5 session oluşturabilirsiniz',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/wa-web/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_name: newSessionName })
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Yeni session oluşturuldu'
        })
        setNewSessionName('')
        loadSessions()
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  // Session'a bağlan
  const handleConnect = async (sessionName: string) => {
    setConnecting(prev => new Set(prev).add(sessionName))
    
    try {
      const response = await fetch(`/api/wa-web/connect?session=${sessionName}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'Bağlantı Başlatıldı',
          description: 'QR kod için bekleyin...'
        })
        setTimeout(loadSessions, 2000)
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: 'Bağlantı Hatası',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setConnecting(prev => {
        const next = new Set(prev)
        next.delete(sessionName)
        return next
      })
    }
  }

  // Session'ı sil
  const handleDelete = async (sessionName: string) => {
    if (!confirm(`"${sessionName}" session'ını silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/wa-web/sessions/${sessionName}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Session silindi'
        })
        loadSessions()
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'qr_pending':
        return <QrCode className="h-5 w-5 text-yellow-500" />
      case 'connecting':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: Session['status']) => {
    switch (status) {
      case 'connected':
        return 'Bağlı'
      case 'qr_pending':
        return 'QR Bekliyor'
      case 'connecting':
        return 'Bağlanıyor'
      default:
        return 'Bağlı Değil'
    }
  }

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'qr_pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      case 'connecting':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Çoklu WhatsApp Bağlantısı</h1>
        <p className="text-muted-foreground mt-1">
          5 farklı WhatsApp numarası ile bağlantı kurabilirsiniz
        </p>
      </div>

      {/* Yeni Session Ekle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Numara Ekle
          </CardTitle>
          <CardDescription>
            Maksimum 5 WhatsApp numarası ekleyebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="session-name">Session Adı</Label>
              <Input
                id="session-name"
                placeholder="Örn: Numara-1, İş-Telefonu, vb."
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSession()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddSession} disabled={sessions.length >= 5}>
                <Plus className="h-4 w-4 mr-2" />
                Ekle
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {sessions.length}/5 session kullanılıyor
          </p>
        </CardContent>
      </Card>

      {/* Session Listesi */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Yükleniyor...
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Henüz session eklenmemiş</p>
            <p className="text-sm mt-2">Yukarıdaki form ile yeni bir WhatsApp bağlantısı ekleyin</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(session.status)}
                      <CardTitle className="text-lg">{session.session_name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(session.session_name)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusText(session.status)}
                  </Badge>

                  {session.phone_number && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Telefon:</span>
                      <p className="font-mono font-medium">{session.phone_number}</p>
                    </div>
                  )}

                  {session.qr_code && session.status === 'qr_pending' && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">QR Kodu Tarayın:</p>
                      <img
                        src={session.qr_code}
                        alt="QR Code"
                        className="w-full aspect-square rounded-lg border"
                      />
                    </div>
                  )}

                  {session.status === 'disconnected' && (
                    <Button
                      onClick={() => handleConnect(session.session_name)}
                      disabled={connecting.has(session.session_name)}
                      className="w-full"
                    >
                      {connecting.has(session.session_name) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Bağlanıyor...
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-4 w-4 mr-2" />
                          Bağlan
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}




