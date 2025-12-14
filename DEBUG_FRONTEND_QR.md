# 🔍 Frontend QR Debug

## ✅ Backend Çalışıyor!
```
[QR API] QR kodu durumu: MEVCUT ✓ (6386 karakter)
[QR API] QR kodu frontend'e gönderiliyor...
```

Backend QR'ı başarıyla gönderiyor! Sorun frontend'te.

## 🐛 Debug Adımları

### 1. Browser Console'u Aç
```
http://localhost:3001/dashboard/wa-web-session
F12 → Console sekmesi
```

### 2. Network Sekmesini Kontrol Et
```
F12 → Network sekmesi
Filter: "qr"
/api/wa-web/qr isteğine tıkla
Response tab'ını aç
```

**Göreceğin şey:**
```json
{
  "success": true,
  "qr_code": "data:image/png;base64,iVBORw0KG..."
}
```

### 3. Console'da Hata Var mı?
```
- Kırmızı hata mesajları var mı?
- "Failed to fetch" gibi network hataları?
- React state güncellenmiyor mu?
```

## 💡 Olası Sorunlar

### Sorun 1: CORS / Network Hatası
**Belirti:** Console'da "Failed to fetch" veya CORS hatası
**Çözüm:** Port 3000 ve 3001 karışıklığı olabilir

### Sorun 2: State Güncellenmiyor
**Belirti:** Network'te QR geliyor ama ekranda yok
**Çözüm:** React state problemi, sayfa yenileme gerekebilir

### Sorun 3: Image Render Hatası
**Belirti:** QR state'de var ama görünmüyor
**Çözüm:** base64 formatı bozulmuş olabilir

## 🔧 Hızlı Test

Browser console'a şunu yapıştır ve çalıştır:
```javascript
fetch('http://localhost:3001/api/wa-web/qr')
  .then(r => r.json())
  .then(data => {
    console.log('QR Response:', data);
    console.log('QR Code length:', data.qr_code?.length);
    console.log('QR starts with:', data.qr_code?.substring(0, 50));
  });
```

**Beklenen çıktı:**
```
QR Response: {success: true, qr_code: "data:image/png;base64,iVB..."}
QR Code length: 6386
QR starts with: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

---

**Sonucu bana söyle!** Console'da ne görüyorsun? 🔍

