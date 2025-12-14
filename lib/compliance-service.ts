import { Contact } from '@/types';
import { isPhoneBlacklisted } from './db/blacklist';

/**
 * Uyum kontrolü sonuçları
 */
export interface ComplianceCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * İçerik kalite kontrolü
 */
export function checkContentQuality(message: string): ComplianceCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Mesaj boş mu?
  if (!message || message.trim().length === 0) {
    errors.push('Mesaj içeriği boş olamaz');
    return { passed: false, errors, warnings };
  }

  // Çok kısa mesaj kontrolü
  if (message.trim().length < 10) {
    warnings.push('Mesaj çok kısa, daha açıklayıcı olabilir');
  }

  // Link sayısı kontrolü (spam önleme)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.match(urlRegex) || [];
  
  if (urls.length > 3) {
    warnings.push(`Mesajda ${urls.length} link var. Spam olarak algılanabilir.`);
  }

  // Kısaltılmış link kontrolü (bit.ly, tinyurl vb)
  const shortUrlRegex = /(bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly)/gi;
  if (shortUrlRegex.test(message)) {
    warnings.push('Kısaltılmış link tespit edildi. WhatsApp tarafından engellenebilir.');
  }

  // Aşırı büyük harf kullanımı
  const upperCaseRatio = (message.match(/[A-ZĞÜŞİÖÇ]/g) || []).length / message.length;
  if (upperCaseRatio > 0.5 && message.length > 20) {
    warnings.push('Mesajda çok fazla büyük harf kullanılmış, spam gibi görünebilir');
  }

  // Tekrarlanan karakterler (!!!, ???, ...)
  const repeatedChars = /(.)\1{4,}/g;
  if (repeatedChars.test(message)) {
    warnings.push('Tekrarlanan karakterler tespit edildi (!!!!, ????). Spam gibi görünebilir.');
  }

  // Aşırı emoji kullanımı
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiCount = (message.match(emojiRegex) || []).length;
  if (emojiCount > 10) {
    warnings.push(`Mesajda ${emojiCount} emoji var. Aşırı emoji kullanımı spam gibi görünebilir.`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Alıcı listesi uyum kontrolü
 */
export async function checkRecipientsCompliance(
  recipients: Contact[],
  requireConsent = true
): Promise<ComplianceCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (recipients.length === 0) {
    errors.push('Alıcı listesi boş');
    return { passed: false, errors, warnings };
  }

  // Consent kontrolü
  if (requireConsent) {
    const noConsentRecipients = recipients.filter(r => !r.consent);
    if (noConsentRecipients.length > 0) {
      errors.push(
        `${noConsentRecipients.length} alıcının açık rızası (consent) yok. ` +
        `Bu kişilere mesaj göndermek yasaktır.`
      );
    }
  }

  // Blacklist kontrolü
  const blacklistedPhones: string[] = [];
  for (const recipient of recipients) {
    const isBlacklisted = await isPhoneBlacklisted(recipient.phone);
    if (isBlacklisted) {
      blacklistedPhones.push(recipient.phone);
    }
  }

  if (blacklistedPhones.length > 0) {
    errors.push(
      `${blacklistedPhones.length} alıcı blacklist'te (STOP/İPTAL listesi). ` +
      `Bu numaralara mesaj gönderilemez.`
    );
  }

  // Aşırı büyük liste uyarısı
  if (recipients.length > 1000) {
    warnings.push(
      `${recipients.length} alıcıya gönderim yapılacak. ` +
      `Büyük listeler ban riskini artırır. Küçük gruplara bölerek göndermek daha güvenlidir.`
    );
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Dosya güvenlik kontrolü
 */
export function checkFileCompliance(
  filename: string,
  fileSizeBytes: number,
  maxSizeMB = 50
): ComplianceCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Dosya boyutu kontrolü
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSizeBytes > maxSizeBytes) {
    errors.push(`Dosya boyutu ${maxSizeMB}MB'ı aşıyor`);
  }

  // Güvenli dosya türleri (whitelist)
  const safeExtensions = [
    // Görseller
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    // Videolar
    '.mp4', '.avi', '.mov', '.webm',
    // Belgeler
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
    // Ses
    '.mp3', '.wav', '.ogg', '.aac'
  ];

  const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!safeExtensions.includes(fileExtension)) {
    errors.push(`Desteklenmeyen dosya türü: ${fileExtension}`);
  }

  // Şüpheli dosya adları
  const suspiciousPatterns = ['.exe', '.bat', '.sh', '.cmd', '.com', '.scr', '.vbs'];
  if (suspiciousPatterns.some(pattern => filename.toLowerCase().includes(pattern))) {
    errors.push('Şüpheli dosya türü tespit edildi');
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Gönderim hız profili kontrolü
 */
export interface RateLimitProfile {
  name: 'low' | 'medium' | 'high';
  perSecond: number;
  perMinute: number;
  delayMin: number;
  delayMax: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const RATE_LIMIT_PROFILES: Record<string, RateLimitProfile> = {
  low: {
    name: 'low',
    perSecond: 1,
    perMinute: 20,
    delayMin: 2000,
    delayMax: 5000,
    description: 'Düşük hız (güvenli, önerilen)',
    riskLevel: 'low'
  },
  medium: {
    name: 'medium',
    perSecond: 2,
    perMinute: 60,
    delayMin: 1000,
    delayMax: 3000,
    description: 'Orta hız (dikkatli kullanın)',
    riskLevel: 'medium'
  },
  high: {
    name: 'high',
    perSecond: 3,
    perMinute: 120,
    delayMin: 500,
    delayMax: 2000,
    description: 'Yüksek hız (riskli, önerilmez)',
    riskLevel: 'high'
  }
};

/**
 * Kampanya uyum kontrolü (kapsamlı)
 */
export async function checkCampaignCompliance(
  message: string,
  recipients: Contact[],
  mediaFilename?: string,
  mediaFileSizeBytes?: number,
  requireConsent = true
): Promise<ComplianceCheckResult> {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // İçerik kontrolü
  const contentCheck = checkContentQuality(message);
  allErrors.push(...contentCheck.errors);
  allWarnings.push(...contentCheck.warnings);

  // Alıcı kontrolü
  const recipientsCheck = await checkRecipientsCompliance(recipients, requireConsent);
  allErrors.push(...recipientsCheck.errors);
  allWarnings.push(...recipientsCheck.warnings);

  // Medya dosyası kontrolü
  if (mediaFilename && mediaFileSizeBytes) {
    const fileCheck = checkFileCompliance(mediaFilename, mediaFileSizeBytes);
    allErrors.push(...fileCheck.errors);
    allWarnings.push(...fileCheck.warnings);
  }

  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

