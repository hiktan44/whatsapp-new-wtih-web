'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TemplateForm } from '@/components/templates/template-form'
import { useToast } from '@/components/ui/use-toast'
import { Template } from '@/types'
import { Plus, Trash2, Edit, FileText, Eye, Image as ImageIcon, Video, Music, File } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const [previewDialog, setPreviewDialog] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Fetch templates error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!templateToDelete) return

    try {
      const response = await fetch(`/api/templates/${templateToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: 'Şablon başarıyla silindi.',
        })
        fetchTemplates()
      } else {
        throw new Error('Silme işlemi başarısız')
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Şablon silinirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    toast({
      title: 'Başarılı!',
      description: selectedTemplate
        ? 'Şablon başarıyla güncellendi.'
        : 'Şablon başarıyla oluşturuldu.',
    })
    fetchTemplates()
    setSelectedTemplate(null)
  }

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template)
    setPreviewDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Şablonlar</h1>
          <p className="text-muted-foreground mt-1">
            Mesaj şablonlarınızı oluşturun ve yönetin
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTemplate(null)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Şablon
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-3xl font-bold text-primary">{templates.length}</p>
            <p className="text-sm text-muted-foreground">Toplam Şablon</p>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Yükleniyor...
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Henüz şablon oluşturulmamış</p>
              <p className="text-sm mt-2">
                Yeni bir şablon oluşturmak için yukarıdaki butonu kullanın
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Oluşturulma: {new Date(template.created_at).toLocaleDateString('tr-TR')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTemplateToDelete(template)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm line-clamp-4 whitespace-pre-wrap font-mono">
                        {template.content}
                      </p>
                    </div>

                    {/* Media Badge */}
                    {template.media_url && (
                      <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                        {template.media_type === 'image' && <ImageIcon className="h-4 w-4 text-primary" />}
                        {template.media_type === 'video' && <Video className="h-4 w-4 text-primary" />}
                        {template.media_type === 'audio' && <Music className="h-4 w-4 text-primary" />}
                        {template.media_type === 'document' && <File className="h-4 w-4 text-primary" />}
                        <span className="text-xs font-medium text-primary">
                          {template.media_filename || 'Medya dosyası ekli'}
                        </span>
                      </div>
                    )}

                    {(template.content.includes('{name}') || 
                      template.content.includes('{surname}') ||
                      template.content.includes('{email}') ||
                      template.content.includes('{address}') ||
                      template.content.includes('{company}')) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {template.content.includes('{name}') && (
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded">
                            {'{name}'}
                          </span>
                        )}
                        {template.content.includes('{surname}') && (
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded">
                            {'{surname}'}
                          </span>
                        )}
                        {template.content.includes('{email}') && (
                          <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">
                            {'{email}'}
                          </span>
                        )}
                        {template.content.includes('{address}') && (
                          <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded">
                            {'{address}'}
                          </span>
                        )}
                        {template.content.includes('{company}') && (
                          <span className="px-2 py-1 bg-pink-500/10 text-pink-600 rounded">
                            {'{company}'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Template Form Dialog */}
      <TemplateForm
        open={formOpen}
        onOpenChange={setFormOpen}
        template={selectedTemplate}
        onSuccess={handleFormSuccess}
      />

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>Şablon önizlemesi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Media Preview */}
            {previewTemplate?.media_url && (
              <div>
                <p className="text-sm font-medium mb-2">Medya Dosyası:</p>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {previewTemplate.media_type === 'image' && <ImageIcon className="h-4 w-4" />}
                    {previewTemplate.media_type === 'video' && <Video className="h-4 w-4" />}
                    {previewTemplate.media_type === 'audio' && <Music className="h-4 w-4" />}
                    {previewTemplate.media_type === 'document' && <File className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {previewTemplate.media_filename || 'Dosya'}
                    </span>
                  </div>
                  {previewTemplate.media_type === 'image' && (
                    <img
                      src={previewTemplate.media_url}
                      alt="Template media"
                      className="max-h-48 rounded-lg object-contain"
                    />
                  )}
                  {previewTemplate.media_type === 'video' && (
                    <video
                      src={previewTemplate.media_url}
                      controls
                      className="max-h-48 rounded-lg w-full"
                    />
                  )}
                  {previewTemplate.media_type === 'audio' && (
                    <audio
                      src={previewTemplate.media_url}
                      controls
                      className="w-full"
                    />
                  )}
                  {previewTemplate.media_type === 'document' && (
                    <a
                      href={previewTemplate.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Dosyayı görüntüle →
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Orijinal İçerik:</p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap font-mono">
                  {previewTemplate?.content}
                </p>
              </div>
            </div>
            {(previewTemplate?.content.includes('{name}') || 
              previewTemplate?.content.includes('{surname}') ||
              previewTemplate?.content.includes('{email}') ||
              previewTemplate?.content.includes('{address}') ||
              previewTemplate?.content.includes('{company}')) && (
              <div>
                <p className="text-sm font-medium mb-2">Örnek Önizleme:</p>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {previewTemplate?.content
                      .replace(/{name}/g, 'Ahmet')
                      .replace(/{surname}/g, 'Yılmaz')
                      .replace(/{email}/g, 'ahmet.yilmaz@email.com')
                      .replace(/{address}/g, 'İstanbul, Türkiye')
                      .replace(/{company}/g, 'ABC Ltd. Şti.')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewDialog(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şablonu Sil</DialogTitle>
            <DialogDescription>
              Bu şablonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          {templateToDelete && (
            <div className="py-4">
              <p className="font-medium">{templateToDelete.name}</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {templateToDelete.content}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setTemplateToDelete(null)
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

