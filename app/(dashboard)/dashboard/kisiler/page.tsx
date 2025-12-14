'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ContactForm } from '@/components/contacts/contact-form'
import { CSVImport } from '@/components/contacts/csv-import'
import { useToast } from '@/components/ui/use-toast'
import { Contact } from '@/types'
import { Search, Plus, Upload, Trash2, Edit, FileDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'

export default function ContactsPage() {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
        setFilteredContacts(data)
      }
    } catch (error) {
      console.error('Fetch contacts error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone.includes(searchQuery) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [searchQuery, contacts])

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!contactToDelete) return

    try {
      const response = await fetch(`/api/contacts/${contactToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: 'Kişi başarıyla silindi.',
        })
        fetchContacts()
      } else {
        throw new Error('Silme işlemi başarısız')
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Kişi silinirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setContactToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    toast({
      title: 'Başarılı!',
      description: selectedContact
        ? 'Kişi başarıyla güncellendi.'
        : 'Kişi başarıyla eklendi.',
    })
    fetchContacts()
    setSelectedContact(null)
  }

  const handleContactToggle = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([])
    } else {
      setSelectedContactIds(filteredContacts.map((c) => c.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedContactIds.length === 0) return

    try {
      const response = await fetch(`/api/contacts?ids=${selectedContactIds.join(',')}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: `${selectedContactIds.length} kişi başarıyla silindi.`,
        })
        setSelectedContactIds([])
        fetchContacts()
      } else {
        throw new Error('Silme işlemi başarısız')
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Kişiler silinirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setBulkDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kişiler</h1>
          <p className="text-muted-foreground mt-1">
            Kişilerinizi ekleyin ve yönetin
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedContactIds.length > 0 && (
            <Button
              onClick={() => setBulkDeleteDialogOpen(true)}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Seçilenleri Sil ({selectedContactIds.length})
            </Button>
          )}
          <Button
            onClick={() => setCsvImportOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            CSV İçe Aktar
          </Button>
          <Button
            onClick={() => {
              setSelectedContact(null)
              setFormOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Yeni Kişi
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-bold text-primary">{contacts.length}</p>
              <p className="text-sm text-muted-foreground">Toplam Kişi</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">{filteredContacts.length}</p>
              <p className="text-sm text-muted-foreground">Gösterilen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ad, soyad, telefon, e-posta, adres veya şirket ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Yükleniyor...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? 'Kişi bulunamadı.' : 'Henüz kişi eklenmemiş.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={
                          filteredContacts.length > 0 &&
                          selectedContactIds.length === filteredContacts.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Ad</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Soyad</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Telefon</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">E-posta</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Şirket</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContacts.map((contact, index) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedContactIds.includes(contact.id)}
                          onCheckedChange={() => handleContactToggle(contact.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">{contact.name}</td>
                      <td className="px-4 py-3 text-sm">{contact.surname}</td>
                      <td className="px-4 py-3 text-sm font-mono">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm">{contact.email || '-'}</td>
                      <td className="px-4 py-3 text-sm">{contact.company || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setContactToDelete(contact)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Form Dialog */}
      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={selectedContact}
        onSuccess={handleFormSuccess}
      />

      {/* CSV Import Dialog */}
      <CSVImport
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onSuccess={() => {
          fetchContacts()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kişiyi Sil</DialogTitle>
            <DialogDescription>
              Bu kişiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          {contactToDelete && (
            <div className="py-4 space-y-1">
              <p className="font-medium">
                {contactToDelete.name} {contactToDelete.surname}
              </p>
              <p className="text-sm text-muted-foreground">{contactToDelete.phone}</p>
              {contactToDelete.email && (
                <p className="text-sm text-muted-foreground">{contactToDelete.email}</p>
              )}
              {contactToDelete.company && (
                <p className="text-sm text-muted-foreground">{contactToDelete.company}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setContactToDelete(null)
              }}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toplu Silme</DialogTitle>
            <DialogDescription>
              {selectedContactIds.length} kişiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Seçilen {selectedContactIds.length} kişi kalıcı olarak silinecektir.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              {selectedContactIds.length} Kişiyi Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

