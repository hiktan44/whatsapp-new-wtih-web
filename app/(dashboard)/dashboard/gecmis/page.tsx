'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageHistory } from '@/types'
import { Search, History as HistoryIcon, Phone, MessageSquare, Image as ImageIcon, Video, Music, File, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function HistoryPage() {
  const [history, setHistory] = useState<MessageHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<MessageHistory[]>([])
  const [todayHistory, setTodayHistory] = useState<MessageHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'today'>('today')

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/message-history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
        setFilteredHistory(data)
        
        // Bugünün mesajlarını filtrele
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayMessages = data.filter((msg: MessageHistory) => {
          const msgDate = new Date(msg.sent_at)
          msgDate.setHours(0, 0, 0, 0)
          return msgDate.getTime() === today.getTime()
        })
        setTodayHistory(todayMessages)
      }
    } catch (error) {
      console.error('Fetch history error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    
    // Her 10 saniyede bir otomatik yenile (live güncelleme için)
    const interval = setInterval(fetchHistory, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const dataToFilter = activeTab === 'today' ? todayHistory : history
    if (searchQuery) {
      const filtered = dataToFilter.filter(
        (item) =>
          item.phone.includes(searchQuery) ||
          item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredHistory(filtered)
    } else {
      setFilteredHistory(dataToFilter)
    }
  }, [searchQuery, history, todayHistory, activeTab])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mesaj Geçmişi</h1>
        <p className="text-muted-foreground mt-1">
          Gönderilen mesajları görüntüleyin
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'today')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bugün
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4" />
            Tüm Geçmiş
          </TabsTrigger>
        </TabsList>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {activeTab === 'today' ? todayHistory.length : history.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Toplam Mesaj</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(activeTab === 'today' ? todayHistory : history).filter((h) => h.status === 'sent').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Başarılı</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(activeTab === 'today' ? todayHistory : history).filter((h) => h.status === 'failed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Başarısız</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Telefon, mesaj veya kişi adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* History List */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Yükleniyor...
            </CardContent>
          </Card>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {searchQuery ? 'Mesaj bulunamadı' : 'Henüz mesaj gönderilmemiş'}
                </p>
                <p className="text-sm mt-2">
                  {searchQuery
                    ? 'Farklı bir arama terimi deneyin'
                    : 'Mesaj gönderdiğinizde burada görünecek'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        item.status === 'sent'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        <Phone className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-mono font-medium">{item.phone}</p>
                            {item.contact_name && (
                              <p className="text-sm text-muted-foreground">
                                {item.contact_name}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:items-end gap-1">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                item.status === 'sent'
                                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                  : 'bg-red-500/10 text-red-700 dark:text-red-400'
                              }`}
                            >
                              {item.status === 'sent' ? 'Gönderildi' : 'Başarısız'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.sent_at)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {/* Media gösterimi */}
                          {item.media_url && (
                            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg text-primary">
                              {item.media_type === 'image' && <ImageIcon className="h-4 w-4" />}
                              {item.media_type === 'video' && <Video className="h-4 w-4" />}
                              {item.media_type === 'audio' && <Music className="h-4 w-4" />}
                              {item.media_type === 'document' && <File className="h-4 w-4" />}
                              <span className="text-xs font-medium">
                                {item.media_filename || 'Medya dosyası ekli'}
                              </span>
                            </div>
                          )}
                          
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  )
}

