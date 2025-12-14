# 🎉 Çoklu Medya ve Link/CTA Özellikleri

## ✨ Yeni Özellikler

### 1. **Çoklu Medya Gönderimi** 📸📹📄
WhatsApp Web ile aynı kişiye birden fazla medya (resim, video, dosya) gönderebilirsiniz.

**Özellikler:**
- ✅ Maksimum 5 dosya aynı anda yüklenebilir
- ✅ Her dosya maksimum 50MB
- ✅ Desteklenen formatlar: Resim, Video, Ses, Doküman
- ✅ Otomatik sıralı gönderim (WhatsApp limitlerini aşmamak için)
- ✅ Her mesaj arasında 2 saniye bekleme (ban önleme)

**Nasıl Çalışır:**
- WhatsApp bir mesajda sadece 1 medya kabul eder
- Sistem birden fazla medyayı sırayla farklı mesajlarda gönderir
- İlk mesajda ana metin + 1. medya
- Sonraki mesajlarda sadece medyalar

### 2. **Şablonlara Link/CTA Ekleme** 🔗
Şablonlarınıza Call-to-Action (Harekete Geçirme) linkleri ekleyebilirsiniz.

**Özellikler:**
- ✅ Her şablona bir link URL eklenebilir
- ✅ Link için özel metin (örn: "Hemen İncele", "Detaylar İçin Tıkla")
- ✅ Mesajın sonuna otomatik eklenir
- ✅ WhatsApp link önizlemesi gösterir

**Link Formatı:**
```
[Mesaj İçeriği]

👉 [Link Metni]
[Link URL]
```

**Örnek:**
```
Merhaba Ahmet,

Yeni ürünlerimizi görmek için aşağıdaki linke tıklayabilirsiniz:

👉 Ürünleri İncele
https://example.com/urunler
```

## 📁 Yapılan Değişiklikler

### Backend

1. **`types/index.ts`**
   - `MediaItem` interface eklendi
   - `Template` interface'e `link_url` ve `link_text` alanları eklendi
   - `media_items` array desteği eklendi

2. **`lib/wa-web-service.ts`**
   - ✅ `sendMessageWithMultipleMedia()` fonksiyonu eklendi
   - Çoklu medya gönderimi için sıralı mesaj desteği
   - Her mesaj arası 2 saniye gecikme (ban önleme)

3. **`app/api/wa-web/send-multi-media/route.ts`**
   - ✅ Yeni endpoint: Çoklu medya + link desteği
   - Link URL'si varsa mesajın sonuna ekler
   - WhatsApp Web ile entegre çalışır

4. **`database-migration-template-links.sql`**
   - ✅ `templates` tablosuna `link_url` ve `link_text` kolonları eklendi
   - ✅ `template_media` tablosu oluşturuldu (çoklu medya için)
   - İndeksler eklendi (performans için)

### Frontend

1. **`components/templates/template-form.tsx`**
   - ✅ Link URL ve Link Text inputları eklendi
   - Form validasyonu güncellendi
   - Önizlemede link gösterimi eklendi
   - Modern, gradient arkaplan ile CTA bölümü

2. **`app/(dashboard)/dashboard/mesaj-gonder/page.tsx`**
   - ✅ Çoklu dosya seçimi desteği
   - ✅ `mediaFiles` array state
   - ✅ Link URL ve Link Text state'leri
   - ✅ `uploadMediaFiles()` - Tüm dosyaları yükler
   - ✅ `handleClearAllFiles()` - Tüm dosyaları temizler
   - ✅ Template seçiminde link yükleme
   - ✅ Mesaj gönderiminde link ekleme

## 🚀 Kullanım

### Şablon Oluşturma

1. **Dashboard** > **Şablonlar** > **Yeni Şablon**
2. Şablon adı ve mesaj içeriği girin
3. **Call-to-Action Link** bölümünde:
   - Link URL: `https://example.com/kampanya`
   - Link Metni: `Kampanyayı İncele`
4. Medya dosyası ekleyin (opsiyonel)
5. **Kaydet**

### Çoklu Medya ile Mesaj Gönderme

1. **Dashboard** > **Mesaj Gönder**
2. **Gönderim Kanalı**: **WhatsApp Web** seçin
3. Alıcı telefon numarası girin
4. Mesaj içeriği yazın
5. **Medya Dosyası** bölümünde:
   - Birden fazla dosya seçin (Ctrl/Cmd + Click)
   - Veya tek tek ekleyin
   - Maksimum 5 dosya
6. **Link** eklemek için (opsiyonel):
   - Link URL girin
   - Link metni girin
7. **Mesaj Gönder / Medya ile Gönder**

### Toplu Gönderim

Çoklu medya ve link özelliği **Toplu Gönderim** modunda da çalışır:
- Tüm alıcılara aynı medyalar gönderilir
- Her alıcıya özelleştirilmiş mesaj (`{name}`, `{surname}` vb.)
- Link otomatik eklenir

## ⚠️ Önemli Notlar

### WhatsApp Web Limitleri

1. **Ban Riski:**
   - Çoklu medya gönderirken her mesaj arası 2 saniye beklenir
   - Toplu gönderimde aynı kural geçerlidir
   - Fazla hızlı gönderim WhatsApp tarafından engellenebilir

2. **Medya Boyutu:**
   - Maksimum dosya boyutu: 50MB
   - Büyük dosyalar yüklenmeyebilir

3. **Link Önizleme:**
   - WhatsApp otomatik olarak link önizlemesi gösterir
   - Önizleme için link'in geçerli bir web sayfası olması gerekir

### Link/CTA ile İlgili

- **Gerçek WhatsApp Butonları Değil:** WhatsApp Web API'si (whatsapp-web.js) gerçek buton/widget oluşturamaz. Sadece metin içinde link gönderebilir.
- **WhatsApp Business API:** Gerçek CTA butonları için WhatsApp Business API gerekir (Yoncu API).
- **Link Önizleme:** Gönderilen linkler WhatsApp'ta otomatik önizleme ile gösterilir, bu da kullanıcı deneyimini artırır.

## 📊 Teknik Detaylar

### API Endpoints

#### Çoklu Medya Gönderimi
```http
POST /api/wa-web/send-multi-media
Content-Type: application/json

{
  "phone": "905xxxxxxxxxx",
  "message": "Merhaba!",
  "mediaItems": [
    {
      "type": "image",
      "data": "https://example.com/image1.jpg",
      "filename": "resim1.jpg"
    },
    {
      "type": "video",
      "data": "https://example.com/video.mp4",
      "filename": "video.mp4"
    }
  ],
  "linkUrl": "https://example.com",
  "linkText": "Detaylar"
}
```

#### Cevap
```json
{
  "success": true,
  "message": "3 medya gönderildi",
  "messageIds": ["msg_id_1", "msg_id_2", "msg_id_3"]
}
```

### Database Schema

#### templates tablosu
```sql
ALTER TABLE templates 
ADD COLUMN link_url TEXT,
ADD COLUMN link_text TEXT;
```

#### template_media tablosu (Gelecek için)
```sql
CREATE TABLE template_media (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES templates(id),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  media_filename TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Sonraki Adımlar

### Yapılabilecek İyileştirmeler

1. **UI İyileştirmesi:**
   - Medya dosyaları için thumbnail preview
   - Drag & drop ile dosya yükleme
   - Progress bar her dosya için

2. **Template Media İlişkisi:**
   - Template'lere direkt çoklu medya bağlama
   - `template_media` tablosunu aktif kullanma

3. **Link Analitiği:**
   - Tıklama sayısı takibi
   - UTM parametreleri otomatik ekleme

4. **Gelişmiş CTA:**
   - Birden fazla link desteği
   - Buton emojileri özelleştirme

## 🐛 Bilinen Sorunlar

1. **Protocol Error:** Puppeteer bağlantısı koptuğunda WhatsApp Web penceresini kapatıp tekrar bağlanmanız gerekir.

2. **Medya Önizleme:** Şu an sadece ilk resim için önizleme gösteriliyor, tüm medyalar için eklenebilir.

## 📞 Destek

Sorunlarınız için:
1. Browser console'u kontrol edin
2. Terminal loglarını inceleyin
3. `[WA]` prefix'li logları arayın

---

**Hazırlayan:** AI Assistant  
**Tarih:** 2025  
**Versiyon:** 1.0.0  
**Lisans:** MIT  

