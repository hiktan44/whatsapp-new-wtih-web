# 🧪 Test Senaryoları - WhatsApp Yönetim Paneli

## ✅ Uygulama Başarıyla Çalışıyor!

```
✓ Next.js 14.2.35
✓ Local: http://localhost:3000
✓ Ready in 1461ms
```

---

## 🎯 TEST ADIM 1: Login Testi

### Tarayıcıda Açın:
```
http://localhost:3000/login
```

### Giriş Bilgileri:
```
👤 Kullanıcı Adı: admin
🔑 Şifre: admin123
```

### Beklenen Sonuç:
- ✅ Login sayfası açılmalı
- ✅ Form görünmeli (kullanıcı adı + şifre)
- ✅ "Giriş Yap" butonu olmalı
- ✅ Giriş yapınca Dashboard'a yönlenmeli

### Olası Hatalar:
- ❌ "Invalid credentials" → Supabase bağlantısını kontrol edin
- ❌ "Network error" → `.env.local` dosyasını kontrol edin
- ❌ Sayfa açılmıyor → Port 3000 kullanımda mı kontrol edin

---

## 🎯 TEST ADIM 2: Dashboard Testi

### URL:
```
http://localhost:3000/dashboard
```

### Kontrol Edilecekler:
- ✅ Sidebar menü görünüyor mu?
- ✅ Header görünüyor mu?
- ✅ İstatistik kartları görünüyor mu?
- ✅ Dark/Light mode toggle çalışıyor mu?

### Sidebar Menü Öğeleri:
- 📊 Dashboard
- 👥 Kişiler
- 📝 Şablonlar
- 👨‍👩‍👧‍👦 Gruplar
- 📤 Mesaj Gönder
- 📱 WhatsApp Web Session
- 🎯 Kampanyalar
- 📜 Geçmiş
- ⚙️ Ayarlar

---

## 🎯 TEST ADIM 3: Kişiler Modülü

### URL:
```
http://localhost:3000/dashboard/kisiler
```

### Test 1: Yeni Kişi Ekleme
1. "Yeni Kişi Ekle" butonuna tıklayın
2. Formu doldurun:
   ```
   Ad: Test
   Soyad: Kullanıcı
   Telefon: +905551234567
   E-posta: test@example.com
   Adres: Test Adresi
   Şirket: Test Şirketi
   ```
3. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Kişi listeye eklenmeli
- ✅ Başarı mesajı görünmeli
- ✅ Form temizlenmeli

### Test 2: CSV Import
1. "CSV İçe Aktar" butonuna tıklayın
2. Test CSV dosyası yükleyin
3. "İçe Aktar" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Kişiler toplu olarak eklenmeli
- ✅ İçe aktarma özeti görünmeli

### Test 3: Kişi Düzenleme
1. Bir kişinin "Düzenle" butonuna tıklayın
2. Bilgileri değiştirin
3. "Güncelle" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Değişiklikler kaydedilmeli
- ✅ Liste güncellenmiş bilgiyi göstermeli

### Test 4: Kişi Silme
1. Bir kişinin "Sil" butonuna tıklayın
2. Onay dialogunu kabul edin

**Beklenen Sonuç:**
- ✅ Kişi listeden silinmeli
- ✅ Silme onay mesajı görünmeli

---

## 🎯 TEST ADIM 4: Şablonlar Modülü

### URL:
```
http://localhost:3000/dashboard/sablonlar
```

### Test 1: Metin Şablonu Oluşturma
1. "Yeni Şablon" butonuna tıklayın
2. Formu doldurun:
   ```
   Şablon Adı: Hoş Geldin Mesajı
   İçerik: Merhaba {name}, hoş geldiniz!
   ```
3. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Şablon listeye eklenmeli
- ✅ Değişkenler ({name}) vurgulanmalı

### Test 2: Medya ile Şablon
1. "Yeni Şablon" butonuna tıklayın
2. Formu doldurun
3. "Medya Ekle" butonuna tıklayın
4. Bir görsel dosyası seçin (jpg, png)
5. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Görsel Supabase Storage'a yüklenmeli
- ✅ Şablon görselle birlikte kaydedilmeli
- ✅ Önizlemede görsel görünmeli

### Test 3: Link/CTA Ekleme
1. Şablon formunda "Link Ekle" bölümünü doldurun:
   ```
   Link URL: https://example.com
   Link Metni: Detaylar için tıklayın
   ```
2. Kaydedin

**Beklenen Sonuç:**
- ✅ Link şablona eklenmeli
- ✅ Önizlemede link görünmeli

---

## 🎯 TEST ADIM 5: Gruplar Modülü

### URL:
```
http://localhost:3000/dashboard/gruplar
```

### Test 1: Yeni Grup Oluşturma
1. "Yeni Grup" butonuna tıklayın
2. Grup bilgilerini girin:
   ```
   Grup Adı: VIP Müşteriler
   Açıklama: Özel müşteri grubu
   ```
3. Kişileri seçin (checkbox ile)
4. "Oluştur" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Grup oluşturulmalı
- ✅ Seçilen kişiler gruba eklenmeli
- ✅ Grup listede görünmeli

### Test 2: Gruba Kişi Ekleme
1. Bir grubun "Düzenle" butonuna tıklayın
2. Yeni kişiler seçin
3. "Güncelle" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Yeni kişiler gruba eklenmeli
- ✅ Grup üye sayısı güncellenmiş olmalı

---

## 🎯 TEST ADIM 6: Mesaj Gönderme (Yöncu API)

### URL:
```
http://localhost:3000/dashboard/mesaj-gonder
```

### Ön Gereksinim:
⚠️ **Önce Ayarlar'dan Yöncu API bilgilerini girin!**
```
Dashboard > Ayarlar
Service ID: your-service-id
Auth Token: your-auth-token
```

### Test 1: Tekli Mesaj Gönderme
1. Telefon numarası girin: `+905551234567`
2. Şablon seçin veya manuel mesaj yazın
3. "Gönder" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Mesaj Yöncu API'ye gönderilmeli
- ✅ Başarı/hata mesajı görünmeli
- ✅ Mesaj geçmişe kaydedilmeli

### Test 2: Toplu Mesaj (Gruba)
1. "Grup Seç" radyo butonunu seçin
2. Bir grup seçin
3. Şablon seçin
4. "Gönder" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Gruptaki tüm kişilere mesaj gitmeli
- ✅ Her mesaj için ayrı kayıt oluşmalı

---

## 🎯 TEST ADIM 7: WhatsApp Web Session

### URL:
```
http://localhost:3000/dashboard/wa-web-session
```

### Test 1: QR Kod Oluşturma
1. "Bağlan" butonuna tıklayın
2. QR kod oluşmasını bekleyin (5-10 saniye)

**Beklenen Sonuç:**
- ✅ QR kod görünmeli
- ✅ QR kod her 30 saniyede yenilenmeli
- ✅ Status "QR Pending" olmalı

### Test 2: WhatsApp'tan Bağlanma
1. Telefonunuzda WhatsApp'ı açın
2. Ayarlar > Bağlı Cihazlar > Cihaz Bağla
3. QR kodu tarayın

**Beklenen Sonuç:**
- ✅ Status "Connected" olmalı
- ✅ Telefon numaranız görünmeli
- ✅ QR kod kaybolmalı
- ✅ Bağlantı saati görünmeli

### Test 3: Mesaj Gönderme (WA Web)
1. Bağlantı kurulduktan sonra
2. "Mesaj Gönder" sekmesine gidin
3. Channel olarak "WhatsApp Web" seçin
4. Mesaj gönderin

**Beklenen Sonuç:**
- ✅ Mesaj WhatsApp Web üzerinden gitmeli
- ✅ Telefonunuzda mesaj görünmeli

---

## 🎯 TEST ADIM 8: Kampanyalar

### URL:
```
http://localhost:3000/dashboard/campaigns
```

### Test 1: Yeni Kampanya Oluşturma
1. "Yeni Kampanya" butonuna tıklayın
2. Kampanya bilgilerini girin:
   ```
   Kampanya Adı: Yılbaşı Kampanyası
   Kanal: WhatsApp Web veya Business API
   Şablon: Bir şablon seçin
   Hedef: Bir grup seçin
   ```
3. Gönderim ayarlarını yapın:
   ```
   Rate Limit: 1 mesaj/saniye
   Rastgele gecikme: Aktif
   Gecikme aralığı: 1000-3000ms
   ```
4. "Oluştur" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Kampanya "draft" olarak oluşmalı
- ✅ Kampanya listede görünmeli

### Test 2: Kampanya Önizleme
1. Kampanyanın "Önizle" butonuna tıklayın
2. Hedef kişileri ve mesaj içeriğini kontrol edin

**Beklenen Sonuç:**
- ✅ Tüm hedef kişiler listelenmeli
- ✅ Kişiselleştirilmiş mesajlar görünmeli
- ✅ Toplam alıcı sayısı doğru olmalı

### Test 3: Kampanya Başlatma
1. "Başlat" butonuna tıklayın
2. Onay dialogunu kabul edin

**Beklenen Sonuç:**
- ✅ Status "running" olmalı
- ✅ Mesajlar sırayla gönderilmeli
- ✅ İstatistikler güncellenmiş olmalı (sent_count)

### Test 4: Kampanya Duraklatma/Devam Ettirme
1. Çalışan kampanyanın "Duraklat" butonuna tıklayın
2. "Devam Ettir" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Kampanya durmalı/devam etmeli
- ✅ Status değişmeli (paused/running)

---

## 🎯 TEST ADIM 9: Mesaj Geçmişi

### URL:
```
http://localhost:3000/dashboard/gecmis
```

### Test:
1. Sayfayı açın
2. Gönderilen mesajları kontrol edin

**Beklenen Sonuç:**
- ✅ Tüm gönderilen mesajlar listelenmeli
- ✅ Filtreleme çalışmalı (tarih, durum)
- ✅ Arama fonksiyonu çalışmalı
- ✅ Sayfalama olmalı (çok mesaj varsa)

---

## 🎯 TEST ADIM 10: Raporlar

### URL:
```
http://localhost:3000/dashboard/reports
```

### Test:
1. Kampanya listesini görüntüleyin
2. Bir kampanyanın raporuna tıklayın

**Beklenen Sonuç:**
- ✅ Kampanya özeti görünmeli
- ✅ Gönderim istatistikleri olmalı
- ✅ Başarılı/başarısız mesaj sayıları
- ✅ Grafik/chart görünmeli

---

## 🎯 TEST ADIM 11: Ayarlar

### URL:
```
http://localhost:3000/dashboard/ayarlar
```

### Test:
1. Yöncu API ayarlarını girin:
   ```
   Service ID: test-service-id
   Auth Token: test-auth-token
   ```
2. "Kaydet" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Ayarlar kaydedilmeli
- ✅ Başarı mesajı görünmeli
- ✅ Mesaj gönderme özelliği aktif olmalı

---

## 🎯 TEST ADIM 12: Responsive Tasarım

### Mobil Test:
1. Browser'da Developer Tools açın (F12)
2. Device toolbar'ı aktif edin (Ctrl+Shift+M)
3. Farklı cihazları test edin:
   - iPhone 12 Pro
   - iPad
   - Samsung Galaxy S20

**Kontrol Edilecekler:**
- ✅ Sidebar mobilde hamburger menü olmalı
- ✅ Tablolar mobilde scroll edilebilir olmalı
- ✅ Formlar mobilde düzgün görünmeli
- ✅ Butonlar dokunmatik uyumlu boyutta olmalı

---

## 🎯 TEST ADIM 13: Dark/Light Mode

### Test:
1. Header'daki theme toggle butonuna tıklayın
2. Dark mode'a geçin
3. Tekrar Light mode'a dönün

**Beklenen Sonuç:**
- ✅ Tüm sayfalar dark mode'da düzgün görünmeli
- ✅ Renkler okunabilir olmalı
- ✅ Tercih kaydedilmeli (sayfa yenilenince korunmalı)

---

## 🎯 TEST ADIM 14: Logout

### Test:
1. Header'daki kullanıcı menüsüne tıklayın
2. "Çıkış Yap" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Login sayfasına yönlendirilmeli
- ✅ Session temizlenmiş olmalı
- ✅ Dashboard'a direkt erişim engellenmiş olmalı

---

## 📊 Test Sonuç Tablosu

| Test Adımı | Durum | Notlar |
|-----------|-------|--------|
| 1. Login | ⬜ | |
| 2. Dashboard | ⬜ | |
| 3. Kişiler | ⬜ | |
| 4. Şablonlar | ⬜ | |
| 5. Gruplar | ⬜ | |
| 6. Mesaj Gönder | ⬜ | |
| 7. WhatsApp Web | ⬜ | |
| 8. Kampanyalar | ⬜ | |
| 9. Geçmiş | ⬜ | |
| 10. Raporlar | ⬜ | |
| 11. Ayarlar | ⬜ | |
| 12. Responsive | ⬜ | |
| 13. Dark Mode | ⬜ | |
| 14. Logout | ⬜ | |

**Durum Kodları:**
- ⬜ Test edilmedi
- ✅ Başarılı
- ⚠️ Kısmi başarılı (minor sorunlar)
- ❌ Başarısız

---

## 🐛 Hata Raporlama

Hata bulursanız şu bilgileri kaydedin:

1. **Hata Mesajı:** (Tam hata metni)
2. **Adımlar:** (Hatayı tekrar oluşturma adımları)
3. **Beklenen:** (Ne olması gerekiyordu)
4. **Gerçekleşen:** (Ne oldu)
5. **Browser:** (Chrome, Firefox, Safari)
6. **Console Logs:** (F12 > Console'daki hatalar)

---

## ✅ Test Tamamlandı!

Tüm testler başarılıysa:
- 🎉 Uygulama production'a hazır!
- 🚀 Docker veya Vercel'e deploy edebilirsiniz
- 📊 Monitoring araçlarını kurabilirsiniz

---

**İyi testler! 🧪**
