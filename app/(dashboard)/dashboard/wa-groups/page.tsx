"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Phone, Users, RefreshCw, Search, Download, User, Crown } from 'lucide-react'
import { toast } from 'sonner'

interface WAGroup {
  id: string
  name: string
  participantCount: number
  isAnnouncementGroup?: boolean
}

export default function WAGroupsPage() {
  const [groups, setGroups] = useState<WAGroup[]>([])
  const [filteredGroups, setFilteredGroups] = useState<WAGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    totalMembers: 0,
    announcementGroups: 0
  })

  // WhatsApp gruplarını çek
  const fetchGroups = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/wa-web/groups')
      const data = await response.json()

      if (data.success) {
        setGroups(data.groups)
        setFilteredGroups(data.groups)

        // İstatistikleri hesapla
        const announcementCount = data.groups.filter((g: WAGroup) => g.isAnnouncementGroup).length
        const totalMembersCount = data.groups.reduce((sum: number, g: WAGroup) => sum + (g.participantCount || 0), 0)

        setStats({
          total: data.groups.length,
          totalMembers: totalMembersCount,
          announcementGroups: announcementCount
        })

        toast.success(`${data.groups.length} grup başarıyla yüklendi`)
      } else {
        toast.error(data.error || 'Gruplar yüklenemedi')
      }
    } catch (error) {
      console.error('Gruplar çekme hatası:', error)
      toast.error('Gruplar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Arama filtreleme
  useEffect(() => {
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredGroups(filtered)
  }, [groups, searchTerm])

  // Sayfa yüklendiğinde grupları çek
  useEffect(() => {
    fetchGroups()
  }, [])

  // CSV olarak indirme
  const downloadCSV = () => {
    const headers = ['Grup Adı', 'Üye Sayısı', 'Tip']
    const rows = filteredGroups.map(group => [
      group.name,
      group.participantCount.toString(),
      group.isAnnouncementGroup ? 'Duyuru Grubu' : 'Normal Grup'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `whatsapp-groups-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('CSV dosyası indirildi')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Grupları</h1>
          <p className="text-muted-foreground">
            WhatsApp hesabınızdaki grupları görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            CSV İndir
          </Button>
          <Button onClick={fetchGroups} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Grup</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              WhatsApp hesabınızdaki toplam grup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Üye</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Tüm gruplardaki toplam üye sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duyuru Grupları</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.announcementGroups}</div>
            <p className="text-xs text-muted-foreground">
              Sadece adminlerin mesaj atabildiği gruplar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle>Arama</CardTitle>
          <CardDescription>
            Grup adı ile arama yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Grup adı..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredGroups.length} sonuç bulundu
            </p>
          )}
        </CardContent>
      </Card>

      {/* Grup Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Gruplar ({filteredGroups.length})</CardTitle>
          <CardDescription>
            WhatsApp hesabınızdaki gruplar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Yükleniyor...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Grup Bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Arama kriterlerinize uygun grup bulunamadı.' : 'WhatsApp hesabınızda grup bulunamadı.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.participantCount} üye
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.isAnnouncementGroup && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Duyuru
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {group.participantCount} kişi
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}