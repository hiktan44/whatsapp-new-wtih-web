'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Contact } from '@/types'
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/utils'

const contactSchema = z.object({
  name: z.string().min(1, 'Ad gereklidir'),
  surname: z.string().min(1, 'Soyad gereklidir'),
  phone: z.string().min(10, 'Telefon numarası gereklidir').refine(
    (val) => validatePhoneNumber(formatPhoneNumber(val)),
    'Geçersiz telefon numarası'
  ),
  email: z.string().email('Geçerli bir e-posta adresi girin').optional().or(z.literal('')),
  address: z.string().optional(),
  company: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact | null
  onSuccess: () => void
}

export function ContactForm({ open, onOpenChange, contact, onSuccess }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  // Contact değiştiğinde formu güncelle
  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        surname: contact.surname,
        phone: contact.phone,
        email: contact.email || '',
        address: contact.address || '',
        company: contact.company || '',
      })
    } else {
      reset({
        name: '',
        surname: '',
        phone: '',
        email: '',
        address: '',
        company: '',
      })
    }
  }, [contact, reset])

  // Dialog kapandığında formu temizle
  useEffect(() => {
    if (!open) {
      reset({
        name: '',
        surname: '',
        phone: '',
        email: '',
        address: '',
        company: '',
      })
    }
  }, [open, reset])

  const onSubmit = async (data: ContactFormData) => {
    try {
      const formattedData = {
        ...data,
        phone: formatPhoneNumber(data.phone),
      }

      const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts'
      const method = contact ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        throw new Error('İşlem başarısız')
      }

      reset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Form submit error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle'}</DialogTitle>
          <DialogDescription>
            {contact
              ? 'Kişi bilgilerini düzenleyin'
              : 'Yeni bir kişi eklemek için bilgileri doldurun'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Örn: Ahmet"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Soyad</Label>
            <Input
              id="surname"
              {...register('surname')}
              placeholder="Örn: Yılmaz"
            />
            {errors.surname && (
              <p className="text-sm text-destructive">{errors.surname.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Örn: +905001112233 veya 5001112233"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta (Opsiyonel)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Örn: ornek@email.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adres (Opsiyonel)</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Örn: İstanbul, Türkiye"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Şirket (Opsiyonel)</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Örn: ABC Ltd. Şti."
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

