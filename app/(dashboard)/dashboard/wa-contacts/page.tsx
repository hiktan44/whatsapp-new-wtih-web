"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Phone, User, RefreshCw, Users, Search, Download } from 'lucide-react'
import { toast } from 'sonner'

interface WAContact {
  id: string
  name: string
  phone: string
  isBusiness?: boolean
}

export default function WAContactsPage() {
  const [contacts, setContacts] = useState<WAContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<WAContact[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    business: 0,
    personal: 0
  })

  // WhatsApp kişilerini çek
  const fetchContacts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/wa-web/contacts')
      const data = await response.json()

      if (data.success) {
        setContacts(data.contacts)
        setFilteredContacts(data.contacts)

        // İstatistikleri hesapla
        const businessCount = data.contacts.filter((c: WAContact) => c.isBusiness).length
        setStats({
          total: data.contacts.length,
          business: businessCount,
          personal: data.contacts.length - businessCount
        })

        toast.success(`${data.contacts.length} kişi başarıyla yüklendi`)
      } else {
        toast.error(data.error || 'Kişiler yüklenemedi')
      }
    } catch (error) {
      console.error('Kişiler çekme hatası:', error)
      toast.error('Kişiler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Arama filtreleme
  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
    )
    setFilteredContacts(filtered)
  }, [contacts, searchTerm])

  // Sayfa yüklendiğinde kişileri çek
  useEffect(() => {
    fetchContacts()
  }, [])

  // CSV olarak indirme
  const downloadCSV = () => {
    const headers = ['Ad', 'Telefon', 'İşletme']
    const rows = filteredContacts.map(contact => [
      contact.name,
      contact.phone,
      contact.isBusiness ? 'Evet' : 'Hayır'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `whatsapp-contacts-${new Date().toISOString().split('T')[0]}.csv`)
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
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Kişileri</h1>
          <p className="text-muted-foreground">
            WhatsApp hesabınızdaki kişileri görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            CSV İndir
          </Button>
          <Button onClick={fetchContacts} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kişi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              WhatsApp rehberinizdeki toplam kişi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İşletme Hesapları</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.business}</div>
            <p className="text-xs text-muted-foreground">
              Business WhatsApp hesapları
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bireysel Hesaplar</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.personal}</div>
            <p className="text-xs text-muted-foreground">
              Standart WhatsApp hesapları
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle>Arama</CardTitle>
          <CardDescription>
            İsim veya telefon numarası ile arama yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İsim veya telefon numarası..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredContacts.length} sonuç bulundu
            </p>
          )}
        </CardContent>
      </Card>

      {/* Kişi Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Kişiler ({filteredContacts.length})</CardTitle>
          <CardDescription>
            WhatsApp rehberinizdeki kişiler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Yükleniyor...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Kişi Bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Arama kriterlerinize uygun kişi bulunamadı.' : 'WhatsApp rehberinizde kişi bulunamadı.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contact.isBusiness && (
                      <Badge variant="secondary" className="text-xs">
                        İşletme
                      </Badge>
                    )}
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