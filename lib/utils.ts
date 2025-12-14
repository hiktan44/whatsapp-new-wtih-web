import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  // Telefon numarasını formatla, her zaman +905XXXXXXXXX formatında döndür
  if (!phone) return '';
  
  // Tüm boşluk ve özel karakterleri temizle, sadece + ve rakamları bırak
  phone = phone.trim().replace(/[^\d+]/g, '');
  
  // Boş string kontrolü
  if (!phone) return '';
  
  // + işaretini kaldır (varsa)
  phone = phone.replace(/\+/g, '');
  
  // Türkiye telefon numarası formatlarını normalize et
  // +905426738234, 905426738234, 05426738234, 5426738234 -> +905426738234
  
  // 90 ile başlıyorsa (905426738234)
  if (phone.startsWith('90')) {
    return '+' + phone;
  }
  
  // 0 ile başlıyorsa (05426738234)
  if (phone.startsWith('0')) {
    return '+9' + phone;
  }
  
  // Sadece 10 haneli numara (5426738234)
  if (phone.length === 10 && phone.startsWith('5')) {
    return '+90' + phone;
  }
  
  // Eğer zaten 12 haneli ve 90 ile başlamıyorsa, başına +90 ekle
  if (phone.length === 10) {
    return '+90' + phone;
  }
  
  // Diğer durumlar için başına + ekle
  if (!phone.startsWith('+')) {
    return '+' + phone;
  }
  
  return phone;
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{10,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

