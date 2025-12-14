import Papa from 'papaparse'
import { Contact } from '@/types'
import { formatPhoneNumber, validatePhoneNumber } from './utils'

export interface CSVParseResult {
  valid: Array<Omit<Contact, 'id' | 'created_at'>>
  invalid: Array<{ row: number; data: any; error: string }>
}

export function parseContactsFile(file: File): Promise<CSVParseResult> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  if (fileExtension === 'csv') {
    return parseCSV(file)
  } else {
    return Promise.reject(new Error('Desteklenmeyen dosya formatı. Sadece CSV destekleniyor.'))
  }
}

function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = parseData(results.data)
        resolve(parsed)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

function parseData(data: any[]): CSVParseResult {
  const valid: Array<Omit<Contact, 'id' | 'created_at'>> = []
  const invalid: Array<{ row: number; data: any; error: string }> = []

  data.forEach((row: any, index: number) => {
    try {
      // Hem Türkçe hem İngilizce başlıkları destekle
      const name = row.Ad || row.ad || row.Name || row.name || ''
      const surname = row.Soyad || row.soyad || row.Surname || row.surname || ''
      const phone = row.Telefon || row.telefon || row.Phone || row.phone || ''
      const email = row.Email || row.email || row['E-posta'] || row['e-posta'] || ''
      const address = row.Adres || row.adres || row.Address || row.address || ''
      const company = row.Şirket || row.şirket || row.Company || row.company || row.Firma || row.firma || ''

      // Telefon alanı boşsa bu kişiyi atla (hata fırlatma, sadece geç)
      if (!phone || !phone.toString().trim()) {
        throw new Error('Telefon numarası boş - atlandı')
      }

      // Zorunlu alan validasyonu
      if (!name.trim()) {
        throw new Error('Ad alanı boş olamaz')
      }
      if (!surname.trim()) {
        throw new Error('Soyad alanı boş olamaz')
      }

      // Telefon numarasını formatla (tüm formatları destekler)
      const formattedPhone = formatPhoneNumber(phone.toString().trim())
      
      // Formatlama sonrası boş string dönerse atla
      if (!formattedPhone) {
        throw new Error('Telefon numarası geçersiz format - atlandı')
      }
      
      if (!validatePhoneNumber(formattedPhone)) {
        throw new Error('Geçersiz telefon numarası formatı')
      }

      valid.push({
        name: name.trim(),
        surname: surname.trim(),
        phone: formattedPhone,
        email: email ? email.trim() : undefined,
        address: address ? address.trim() : undefined,
        company: company ? company.trim() : undefined,
      })
    } catch (error: any) {
      invalid.push({
        row: index + 2, // +2 because index starts at 0 and header is row 1
        data: row,
        error: error.message,
      })
    }
  })

  return { valid, invalid }
}

export function downloadCSVTemplate() {
  const csvContent = 'Ad,Soyad,Telefon,Email,Adres,Şirket\n'
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', 'kisiler_sablonu.csv')
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

