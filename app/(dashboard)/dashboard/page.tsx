'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Send, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const quickActions = [
  {
    title: 'Mesaj Gönder',
    description: 'Hızlıca mesaj gönderin',
    href: '/dashboard/mesaj-gonder',
    icon: Send,
  },
  {
    title: 'Kişi Ekle',
    description: 'Yeni kişi ekleyin',
    href: '/dashboard/kisiler',
    icon: Users,
  },
  {
    title: 'Şablon Oluştur',
    description: 'Yeni şablon oluşturun',
    href: '/dashboard/sablonlar',
    icon: FileText,
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    contacts: 0,
    templates: 0,
    messages: 0,
    queue: 0,
    loading: true,
  })
  const fetchingRef = useRef(false)

  useEffect(() => {
    const fetchStats = async () => {
      // Eğer zaten bir istek yapılıyorsa, yeni istek yapma
      if (fetchingRef.current) {
        console.log('Dashboard stats already fetching, skipping...')
        return
      }

      fetchingRef.current = true

      try {
        // Fetch all stats in parallel
        const [contactsRes, templatesRes, messagesRes, queueRes] = await Promise.all([
          fetch('/api/contacts', { cache: 'no-store' }),
          fetch('/api/templates', { cache: 'no-store' }),
          fetch('/api/message-history', { cache: 'no-store' }),
          fetch('/api/yoncu/queue', { cache: 'no-store' }).catch(() => ({ ok: false })), // Queue optional
        ])

        const contacts = contactsRes.ok ? await contactsRes.json() : []
        const templates = templatesRes.ok ? await templatesRes.json() : []
        const messages = messagesRes.ok ? await messagesRes.json() : []
        const queueData = queueRes.ok && 'json' in queueRes ? await queueRes.json() : { count: 0 }

        setStats({
          contacts: Array.isArray(contacts) ? contacts.length : 0,
          templates: Array.isArray(templates) ? templates.length : 0,
          messages: Array.isArray(messages) ? messages.length : 0,
          queue: queueData.count || 0,
          loading: false,
        })
      } catch (error) {
        console.error('Stats fetch error:', error)
        setStats(prev => ({ ...prev, loading: false }))
      } finally {
        fetchingRef.current = false
      }
    }

    // Component mount kontrolü
    let isMounted = true

    const initStats = async () => {
      if (isMounted) {
        await fetchStats()
      }
    }

    initStats()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        fetchStats()
      }
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const statsData = [
    {
      title: 'Toplam Kişi',
      value: stats.loading ? '...' : stats.contacts.toString(),
      description: 'Kayıtlı kişi sayısı',
      icon: Users,
      href: '/dashboard/kisiler',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Şablonlar',
      value: stats.loading ? '...' : stats.templates.toString(),
      description: 'Kayıtlı şablon sayısı',
      icon: FileText,
      href: '/dashboard/sablonlar',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Gönderilen Mesajlar',
      value: stats.loading ? '...' : stats.messages.toString(),
      description: 'Toplam gönderim',
      icon: Send,
      href: '/dashboard/gecmis',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Kuyruktaki Mesajlar',
      value: stats.loading ? '...' : stats.queue.toString(),
      description: 'Bekleyen mesaj',
      icon: Clock,
      href: '/dashboard/kuyruk',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  const quickActions = [
    {
      title: 'Mesaj Gönder',
      description: 'Hızlıca mesaj gönderin',
      href: '/dashboard/mesaj-gonder',
      icon: Send,
    },
    {
      title: 'Kişi Ekle',
      description: 'Yeni kişi ekleyin',
      href: '/dashboard/kisiler',
      icon: Users,
    },
    {
      title: 'Şablon Oluştur',
      description: 'Yeni şablon oluşturun',
      href: '/dashboard/sablonlar',
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gösterge Paneli</h1>
        <p className="text-muted-foreground mt-2">
          WhatsApp mesajlaşma yönetim panelinize hoş geldiniz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5 text-primary group-hover:text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{action.title}</CardTitle>
                          <CardDescription>{action.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Hoş Geldiniz! 👋</CardTitle>
          <CardDescription>
            Bu panel ile WhatsApp mesajlarınızı kolayca yönetebilirsiniz.
            Başlamak için yukarıdaki hızlı işlemlerden birini seçin veya
            yan menüden istediğiniz bölüme gidin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Kişilerinizi ekleyin ve yönetin</p>
            <p>• Mesaj şablonları oluşturun</p>
            <p>• Tekil veya toplu mesaj gönderin</p>
            <p>• Mesaj geçmişinizi ve kuyruğunuzu takip edin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

