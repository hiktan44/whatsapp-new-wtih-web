'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { parseContactsFile, downloadCSVTemplate } from '@/lib/csv-parser'
import { Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CSVImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CSVImport({ open, onOpenChange, onSuccess }: CSVImportProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [result, setResult] = useState<{
    valid: number
    invalid: number
    errors: Array<{ row: number; error: string }>
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setParsing(true)
    try {
      const parseResult = await parseContactsFile(file)

      if (parseResult.valid.length > 0) {
        // Bulk create contacts
        const response = await fetch('/api/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parseResult.valid),
        })

        if (!response.ok) {
          throw new Error('İçe aktarma başarısız')
        }

        setResult({
          valid: parseResult.valid.length,
          invalid: parseResult.invalid.length,
          errors: parseResult.invalid.map((item) => ({
            row: item.row,
            error: item.error,
          })),
        })

        toast({
          title: 'Başarılı!',
          description: `${parseResult.valid.length} kişi başarıyla içe aktarıldı.`,
        })

        if (parseResult.invalid.length === 0) {
          setTimeout(() => {
            onSuccess()
            onOpenChange(false)
            setFile(null)
            setResult(null)
          }, 2000)
        }
      } else {
        setResult({
          valid: 0,
          invalid: parseResult.invalid.length,
          errors: parseResult.invalid.map((item) => ({
            row: item.row,
            error: item.error,
          })),
        })

        toast({
          title: 'Hata!',
          description: 'Geçerli kişi bulunamadı.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: 'Hata!',
        description: 'Dosya içe aktarılırken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setParsing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Toplu Kişi İçe Aktarma</DialogTitle>
          <DialogDescription>
            CSV dosyası yükleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">CSV Şablonu</p>
              <p className="text-sm text-muted-foreground">
                Örnek dosyayı indirin ve doldurun
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSVTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Şablon İndir
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV Dosyası</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <Button
                  onClick={handleImport}
                  disabled={parsing}
                >
                  {parsing ? (
                    'İşleniyor...'
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      İçe Aktar
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Desteklenen dosya türleri: CSV | Kolonlar: Ad, Soyad, Telefon (zorunlu), Email, Adres, Şirket (opsiyonel)
            </p>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">{result.valid}</p>
                    <p className="text-xs">Başarılı</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">{result.invalid}</p>
                    <p className="text-xs">Hatalı</p>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Hatalar:</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-destructive/10 text-destructive rounded"
                      >
                        Satır {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setFile(null)
              setResult(null)
              onOpenChange(false)
            }}
          >
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}

