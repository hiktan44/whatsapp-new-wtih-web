'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Group, Contact } from '@/types'
import { Plus, Trash2, Edit, Users, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GroupsPage() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<Array<Group & { contact_count?: number }>>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [addContactsOpen, setAddContactsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [groupContacts, setGroupContacts] = useState<Contact[]>([])
  const [viewContactsOpen, setViewContactsOpen] = useState(false)
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null)

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups?withCount=true')
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Fetch groups error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Fetch contacts error:', error)
    }
  }

  const fetchGroupContacts = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/contacts`)
      if (response.ok) {
        const data = await response.json()
        setGroupContacts(data)
      }
    } catch (error) {
      console.error('Fetch group contacts error:', error)
    }
  }

  useEffect(() => {
    fetchGroups()
    fetchContacts()
  }, [])

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Hata!',
        description: 'Grup adı boş olamaz.',
        variant: 'destructive',
      })
      return
    }

    try {
      const url = selectedGroup ? `/api/groups/${selectedGroup.id}` : '/api/groups'
      const method = selectedGroup ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: selectedGroup ? 'Grup güncellendi.' : 'Grup oluşturuldu.',
        })
        fetchGroups()
        setFormOpen(false)
        resetForm()
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'İşlem başarısız oldu.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!groupToDelete) return

    try {
      const response = await fetch(`/api/groups/${groupToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: 'Grup silindi.',
        })
        fetchGroups()
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Grup silinemedi.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
    }
  }

  const handleAddContacts = async () => {
    if (!selectedGroup || selectedContactIds.length === 0) {
      toast({
        title: 'Hata!',
        description: 'Lütfen en az bir kişi seçin.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: selectedContactIds,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: `${selectedContactIds.length} kişi gruba eklendi.`,
        })
        setAddContactsOpen(false)
        setSelectedContactIds([])
        fetchGroups()
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Kişiler eklenemedi.',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    if (!viewingGroup) return

    try {
      const response = await fetch(
        `/api/groups/${viewingGroup.id}/contacts?contactId=${contactId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: 'Kişi gruptan çıkarıldı.',
        })
        fetchGroupContacts(viewingGroup.id)
        fetchGroups()
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Kişi çıkarılamadı.',
        variant: 'destructive',
      })
    }
  }

  const openEditForm = (group: Group) => {
    setSelectedGroup(group)
    setGroupName(group.name)
    setGroupDescription(group.description || '')
    setFormOpen(true)
  }

  const openAddContactsDialog = (group: Group) => {
    setSelectedGroup(group)
    setSelectedContactIds([])
    setAddContactsOpen(true)
  }

  const openViewContactsDialog = async (group: Group) => {
    setViewingGroup(group)
    await fetchGroupContacts(group.id)
    setViewContactsOpen(true)
  }

  const resetForm = () => {
    setSelectedGroup(null)
    setGroupName('')
    setGroupDescription('')
  }

  const handleContactToggle = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAll = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([])
    } else {
      setSelectedContactIds(contacts.map((c) => c.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gruplar</h1>
          <p className="text-muted-foreground mt-1">
            Kişi gruplarınızı oluşturun ve yönetin
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Grup
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-bold text-primary">{groups.length}</p>
              <p className="text-sm text-muted-foreground">Toplam Grup</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">
                {groups.reduce((sum, g) => sum + (g.contact_count || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Toplam Kişi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            Yükleniyor...
          </div>
        ) : groups.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            Henüz grup oluşturulmamış.
          </div>
        ) : (
          groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription className="mt-1">
                          {group.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{group.contact_count || 0} kişi</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openViewContactsDialog(group)}
                        className="flex-1"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAddContactsDialog(group)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setGroupToDelete(group)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Group Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? 'Grup Düzenle' : 'Yeni Grup Oluştur'}
            </DialogTitle>
            <DialogDescription>
              Grup bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Grup Adı *</Label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Örn: VIP Müşteriler"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Grup hakkında kısa bir açıklama..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {selectedGroup ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contacts Dialog */}
      <Dialog open={addContactsOpen} onOpenChange={setAddContactsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Gruba Kişi Ekle</DialogTitle>
            <DialogDescription>
              {selectedGroup?.name} grubuna eklenecek kişileri seçin
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedContactIds.length} kişi seçildi
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedContactIds.length === contacts.length
                    ? 'Seçimi Temizle'
                    : 'Tümünü Seç'}
                </Button>
              </div>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                  >
                    <Checkbox
                      id={contact.id}
                      checked={selectedContactIds.includes(contact.id)}
                      onCheckedChange={() => handleContactToggle(contact.id)}
                    />
                    <label
                      htmlFor={contact.id}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {contact.name} {contact.surname} - {contact.phone}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactsOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddContacts}>
              {selectedContactIds.length} Kişiyi Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Group Contacts Dialog */}
      <Dialog open={viewContactsOpen} onOpenChange={setViewContactsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{viewingGroup?.name} - Kişiler</DialogTitle>
            <DialogDescription>
              Bu gruptaki {groupContacts.length} kişi
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {groupContacts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Bu grupta henüz kişi yok.
              </div>
            ) : (
              <div className="space-y-2">
                {groupContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 hover:bg-muted rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {contact.name} {contact.surname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contact.phone}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveContact(contact.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewContactsOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grubu Sil</DialogTitle>
            <DialogDescription>
              Bu grubu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              Gruptaki kişiler silinmeyecek, sadece grup ilişkisi kaldırılacaktır.
            </DialogDescription>
          </DialogHeader>
          {groupToDelete && (
            <div className="py-4">
              <p className="font-medium">{groupToDelete.name}</p>
              {groupToDelete.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {groupToDelete.description}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setGroupToDelete(null)
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
    </div>
  )
}
