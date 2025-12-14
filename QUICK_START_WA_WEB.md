# 🚀 WhatsApp Web/Desktop - Hızlı Başlangıç

Bu kılavuz size 5 dakikada WhatsApp Web kanalını çalıştırmayı gösterir.

## ✅ Ön Hazırlık Kontrol Listesi

- [ ] Node.js 18+ yüklü
- [ ] npm install tamamlandı
- [ ] Supabase projesi kurulu
- [ ] `.env.local` dosyası yapılandırılmış
- [ ] Database migration (database-migration-wa-web.sql) çalıştırıldı

## 📋 Adım Adım Kurulum

### 1. Database Migration

```bash
# Supabase Dashboard > SQL Editor
# database-migration-wa-web.sql dosyasını kopyala ve çalıştır
```

Veya terminal'den:
```sql
-- Bu SQL kodlarını Supabase SQL Editor'da çalıştırın
-- Dosya: database-migration-wa-web.sql
```

### 2. Uygulamayı Başlat

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacak.

### 3. WhatsApp Web Oturumu Aç

1. Tarayıcıda http://localhost:3000/login
2. Giriş yap (admin / admin123)
3. Sol menüden **"WA Web Oturumu"** sekmesine tıkla
4. **"Bağlan"** butonuna tıkla
5. QR kodu ekranda belirecek
6. Telefonunda WhatsApp aç:
   - **Ayarlar** > **Bağlı Cihazlar** > **Cihaz Bağla**
   - QR'ı tara
7. Durum "Bağlı" olarak değişecek ✅

### 4. Demo: İlk Kampanyayı Oluştur

#### 4.1 Test Kişileri Ekle

Dashboard > **Kişiler** > **Yeni Kişi**

```
Ad: Test
Soyad: Kullanıcı
Telefon: +905XXXXXXXXX (kendi numaran)
```

**ÖNEMLİ:** Consent'i aktif et:
- Supabase Dashboard > Table Editor > contacts
- İlgili kaydı bul
- `consent` = `true` yap
- `consent_date` = şu anki tarih
- `consent_source` = `manual_entry`

#### 4.2 Kampanya Oluştur

Dashboard > **Kampanyalar** > **Yeni Kampanya**

```
Kampanya Adı: İlk Test Kampanyası
Kanal: WhatsApp Web/Desktop
Mesaj Şablonu:
  Merhaba {name},
  
  Bu bir test mesajıdır. WhatsApp Web entegrasyonu başarılı! ✅
  
Hedef Kitle: Kayıtlı Kişiler
Hız Profili: Düşük Hız (Güvenli)
```

**Kampanya Oluştur** butonuna tıkla.

#### 4.3 Ön İzleme ve Gönderim

1. Kampanya listesinde **"Gönder"** butonuna tıkla
2. **Ön İzleme** sayfası açılacak:
   - ✅ Alıcı bilgileri
   - ✅ Kişiselleştirilmiş mesaj
   - ✅ Uyum kontrolleri
3. Onay kutusunu işaretle:
   > "Tüm alıcıların açık rızası olduğunu onaylıyorum"
4. **"Kampanyayı Başlat"** butonuna tıkla

#### 4.4 Sonuçları İzle

Dashboard > **Raporlar** > İlgili kampanya

- 📊 Gerçek zamanlı istatistikler
- ✅ Başarılı mesajlar
- ❌ Başarısız mesajlar (varsa)
- 📋 Detaylı job listesi

### 5. Kişileri ve Grupları İçe Aktar

#### Kişileri Getir
WA Web Oturumu > **"Kişileri Getir"** butonu
- WhatsApp kişileriniz listelenecek
- **"CSV İndir"** ile dışa aktarabilirsiniz

#### Grupları Getir
WA Web Oturumu > **"Grupları Getir"** butonu
- WhatsApp gruplarınız listelenecek

## 🎯 Demo Senaryolar

### Senaryo 1: Kendine Test Mesajı

```
Hedef: Kendi numaran
Mesaj: Merhaba {name}, bu bir test mesajıdır!
Süre: ~3 saniye
```

### Senaryo 2: Küçük Grup (5 kişi)

```
Hedef: 5 test kişisi (kendin + arkadaşlar)
Mesaj: Kişiselleştirilmiş mesaj
Hız: Düşük
Süre: ~15-30 saniye
```

### Senaryo 3: Manuel Numara Listesi

```
Hedef: Manuel liste
Numaralar:
  +905XXXXXXXXX
  +905XXXXXXXXX
  +905XXXXXXXXX
Mesaj: Merhaba, bu toplu mesaj testidir
```

## ⚠️ İlk Kullanım İçin Öneriler

### Yapılması Gerekenler ✅

1. **Küçük başla:** İlk testlerde max 5-10 kişiye gönder
2. **Kendi numaranı kullan:** İlk testlerde sadece kendine gönder
3. **Düşük hız profili:** Her zaman düşük hızda başla
4. **Consent kontrol et:** Sadece izinli kişilere gönder
5. **Günlük limit:** Günde max 200-300 mesaj

### Yapılmaması Gerekenler ❌

1. ❌ Hemen büyük listeler (100+ kişi)
2. ❌ Yüksek hız profili
3. ❌ Rızasız gönderim
4. ❌ Spam benzeri mesajlar
5. ❌ Gece saatlerinde gönderim

## 🛡️ Güvenlik Kontrol Listesi

Gönderim öncesi kontrol et:

- [ ] Tüm alıcıların `consent = true`
- [ ] Blacklist'te olmadıklarından emin ol
- [ ] Mesajda spam içerik yok
- [ ] Hız profili düşük
- [ ] Test edildi ve çalışıyor
- [ ] Kampanya ön izlemesi yapıldı

## 🔧 Sorun Giderme (Quick Fixes)

### "QR Kod Görünmüyor"
```bash
# Solution 1: Sayfayı yenile (F5)
# Solution 2: Oturumu kapat ve tekrar bağlan
# Solution 3: Browser console'u kontrol et (F12)
```

### "Bağlantı Kopuyor"
```bash
# Solution 1: İnternet bağlantısını kontrol et
# Solution 2: .wwebjs_auth klasörünü sil ve yeniden bağlan
rm -rf .wwebjs_auth
# Solution 3: Uygulamayı restart et
```

### "Mesaj Gönderilmiyor"
```sql
-- Solution 1: Consent kontrolü
SELECT * FROM contacts WHERE id = 'contact_id';
-- consent = true olmalı

-- Solution 2: Blacklist kontrolü
SELECT * FROM blacklist WHERE phone = '+905XXXXXXXXX';
-- Kayıt yoksa OK
```

### "Database Hatası"
```bash
# Solution: Migration'ı tekrar çalıştır
# Supabase Dashboard > SQL Editor > database-migration-wa-web.sql
```

## 📊 İlk Rapor Analizi

Kampanya tamamlandıktan sonra:

1. **Başarı Oranı:** %90+ ise harika!
2. **Başarısız Mesajlar:** Hata nedenlerini incele
3. **Ortalama Süre:** Beklendiği gibi mi?
4. **Alıcı Geri Dönüşleri:** STOP yazan var mı?

## 📝 Next Steps

İlk testi tamamladıktan sonra:

1. [ ] Daha büyük listelerle test et (20-50 kişi)
2. [ ] Medya gönderimini test et (görsel/video)
3. [ ] Farklı hız profillerini dene
4. [ ] Blacklist yönetimini test et (STOP/İPTAL)
5. [ ] CSV export özelliğini kullan

## 🎓 Daha Fazla Bilgi

- **Detaylı Kurulum:** [WA_WEB_SETUP.md](WA_WEB_SETUP.md)
- **Ana README:** [README.md](README.md)
- **Database Setup:** [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 💬 Demo Video Akışı (5 dk)

```
00:00 - Giriş ve WA Web Session
00:30 - QR kod tarama
01:00 - Kişileri getirme
01:30 - Kampanya oluşturma
02:30 - Ön izleme ve kontroller
03:00 - Kampanya başlatma
03:30 - Rapor inceleme
04:30 - Sonuç ve öneriler
```

---

**Başarılar!** 🎉

Herhangi bir sorun yaşarsan:
1. Browser console loglarını kontrol et (F12)
2. Terminal loglarını incele
3. Supabase logs'a bak
4. GitHub Issues'ta ara veya yeni konu aç

