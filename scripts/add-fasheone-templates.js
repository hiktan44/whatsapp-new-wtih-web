const templates = [
  {
    name: "FasheOne - E-Ticaret Satıcıları",
    content: `Merhaba {name} 👋

Ürün fotoğrafı çekimi için binlerce lira harcamaktan yoruldunuz mu?

FasheOne ile artık stüdyo çekimine gerek yok! 📸

✨ AI ile saniyeler içinde:
• Profesyonel ürün fotoğrafları
• Canlı model görselleri  
• Sosyal medya videoları

💰 Tek görsel = 5₺ (Stüdyo çekimi: 50-200₺)

🎁 10 ÜCRETSİZ KREDİ ile hemen deneyin!

👇 Kredi kartı gerekmez`,
    link_url: "https://fasheone.com",
    link_text: "Ücretsiz Dene"
  },
  {
    name: "FasheOne - Toptan Satıcılar",
    content: `Sayın {name},

📦 Yüzlerce ürününüz var ama profesyonel katalog oluşturamıyor musunuz?

FasheOne ile dakikalar içinde:

🎨 Çiziminizi yükleyin → Gerçekçi ürün fotoğrafı
👗 Ürünü model üzerinde görün
📹 Sosyal medya videoları oluşturun
📋 Teknik çizim (Tech Pack) alın

Toptan müşterilerinizi etkileyecek görseller!

⚡ Geleneksel yöntemlerden 10X HIZLI
💵 10X UCUZ

Hemen deneyin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Ücretsiz Başla"
  },
  {
    name: "FasheOne - İhracatçılar",
    content: `Merhaba {name} 🌍

Yurt dışı müşterilerinize ürünlerinizi nasıl gösteriyorsunuz?

�� FasheOne ile GLOBAL STANDARTLARDA görsel üretin:

📸 Profesyonel stüdyo kalitesinde fotoğraf
👩‍🦰 Farklı etnik kökenlerde AI modeller
🏙️ "Paris'te", "New York'ta" gibi arka planlar
📹 Podyum yürüyüşü videoları

🎯 Uluslararası alıcıları etkileyin!

Prompt ile istediğiniz sahneyi yaratın:
"Eiffel Kulesi önünde model" ✅

İhracatınızı güçlendirin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Keşfet"
  },
  {
    name: "FasheOne - Tasarımcılar",
    content: `Merhaba {name} ✨

Çizimlerinizi GERÇEĞE dönüştürün! 🎨

FasheOne AI ile:

✏️ Karakalem veya dijital çizim yükle
👗 Saniyeler içinde gerçekçi ürün fotoğrafı al
👩 İstediğin model üzerinde gör
📹 Podyum videosu oluştur
📐 Teknik çizim (Tech Pack) al

Koleksiyonunuzu üretmeden önce görselleştirin!

💡 Prompt ile:
"Vintage atmosfer", "Minimalist estetik"
gibi stiller uygulayın

🎁 10 ücretsiz kredi sizi bekliyor!`,
    link_url: "https://fasheone.com",
    link_text: "Hemen Dene"
  },
  {
    name: "FasheOne - Modelistler",
    content: `Sayın {name},

📐 TEKNİK ÇİZİM (TECH PACK) ARTIK DAKİKALAR İÇİNDE!

FasheOne ile ürün fotoğrafınızı yükleyin:

✅ Detaylı teknik çizim oluşturun
✅ Dikiş hatları otomatik algılansın
✅ Üretim için hazır dosya alın
✅ Tüm detaylar korunsun

Müşterilerinize profesyonel Tech Pack sunun!

1 Teknik Çizim = Sadece 1 Kredi (5₺)

Şimdi deneyin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Tech Pack Oluştur"
  },
  {
    name: "FasheOne - Video Oluşturma",
    content: `{name}, sosyal medyada fark yaratın! 📱

Instagram & TikTok için profesyonel VİDEO içerik:

🎬 FasheOne ile:
• Podyum yürüyüşü videoları
• Model dönen ürün tanıtımı
• 5-10 saniyelik reklam videoları

Sadece görsel yükle → VIDEO AL! 🔥

💰 1 Video = 3 Kredi (15₺)
(Video prodüksiyon: 500-2000₺+)

Müşteri yorumu:
"Video özelliği harika, sosyal medyada çok beğeniliyor!" - Mehmet K.

Hemen deneyin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Video Oluştur"
  },
  {
    name: "FasheOne - Maliyet Karşılaştırma",
    content: `Merhaba {name} 💰

MODA GÖRSEL MALİYETLERİNİ KARŞILAŞTIRALIM:

❌ Geleneksel Yöntem:
• Fotoğrafçı: 500-2000₺
• Model: 1000-3000₺
• Stüdyo: 500-1500₺
• Video: 2000-5000₺
TOPLAM: 4000-11500₺+

✅ FasheOne:
• Ürün fotoğrafı: 5₺
• Canlı model: 5₺
• Video: 15₺
TOPLAM: 25₺!

%99 TASARRUF! 🚀

10 ücretsiz kredi ile deneyin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Tasarruf Et"
  },
  {
    name: "FasheOne - AI Model Çeşitliliği",
    content: `{name} 👋

Tek ürün, SINIRSIZ MODEL seçeneği! 👗

FasheOne AI ile ürününüzü:

👩‍🦰 Farklı saç stilleri
🌍 Farklı ten renkleri
💃 Farklı pozlar
🏖️ Farklı arka planlar

üzerinde görün!

Prompt ile özelleştirin:
"Parkta oturan, elinde kahve tutan model" ✅
"Köprüde rüzgarda savrulan saçlar" ✅

Her müşteri kitlesine hitap edin!

Ücretsiz deneyin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Modelleri Gör"
  },
  {
    name: "FasheOne - Hoş Geldin",
    content: `Merhaba {name}! 🎨

MODA TASARIMINDA DEVRİM: FasheOne!

📱 3 Adımda Profesyonel Görsel:

1️⃣ Çizim veya ürün fotoğrafı yükle
2️⃣ Hazır şablonlardan stil seç
3️⃣ AI ile oluştur & indir!

✨ Prompt yazmana gerek YOK
✨ Tek platformda HER ŞEY
✨ Abonelik YOK - kullandıkça öde

📊 50.000+ görsel oluşturuldu
⭐ %98 müşteri memnuniyeti

🎁 Yeni üyelere 10 ÜCRETSİZ KREDİ!

Hemen başla 👇`,
    link_url: "https://fasheone.com",
    link_text: "Ücretsiz Başla"
  },
  {
    name: "FasheOne - Marka Yerleştirme",
    content: `Sayın {name},

MARKANIZI GÖRSELLERİNİZE YERLEŞTİRİN! 🏷️

FasheOne AI Prompt ile:

🖼️ "Arka planda [MarkaAdı] logosu"
🏬 "Duvarda marka afişi"
🎨 "Kurumsal renklerle uyumlu atmosfer"

yazın, AI markalı görsel oluştursun!

Ek özellikler:
• Özel arka plan yükleme
• "Eiffel Kulesi önünde" gibi mekan seçimi
• Detaylı sahne kurgusu

Markanızı profesyonelce tanıtın!

Şimdi deneyin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Marka Görseli Oluştur"
  },
  {
    name: "FasheOne - Genel (Moda Profesyonelleri)",
    content: `Merhaba {name} 👋

🎨 MODA SEKTÖRÜNDE AI DEVRİMİ!

İster tasarımcı, ister e-ticaret satıcısı, ister üretici olun...

FasheOne ile:
✏️ Çizimden profesyonel ürün fotoğrafı
👗 AI model üzerinde görselleştirme
📹 Sosyal medya videoları
📐 Teknik çizim (Tech Pack)

💰 Stüdyo çekimi maliyetinin %1'i
⚡ Dakikalar içinde sonuç
🎯 Prompt ile sınırsız özelleştirme

🎁 10 ÜCRETSİZ KREDİ ile başlayın!

Hemen keşfedin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Ücretsiz Dene"
  },
  {
    name: "FasheOne - Genel (Tekstil Sektörü)",
    content: `Sayın {name},

📢 TEKSTİL & KONFEKSİYON PROFESYONELLERİNE ÖZEL!

FasheOne AI Platformu ile tanışın:

🎨 Tasarımcılar → Çizimlerinizi hayata geçirin
🏭 Üreticiler → Teknik çizim alın
🛒 E-ticaret → Profesyonel ürün görseli
📦 Toptancılar → Katalog oluşturun
🌍 İhracatçılar → Global standart görseller
✂️ Modelistler → Tech Pack hazırlayın

50.000+ görsel | %98 memnuniyet | 24/7 erişim

Sektörün geleceği AI ile şekilleniyor!

Ücretsiz deneyin 👇`,
    link_url: "https://fasheone.com",
    link_text: "Hemen Başla"
  }
];

async function addTemplates() {
  console.log("🚀 FasheOne şablonları ekleniyor...\n");
  
  for (const template of templates) {
    try {
      const response = await fetch("http://localhost:3000/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Eklendi: ${template.name}`);
      } else {
        const error = await response.text();
        console.log(`❌ Hata (${template.name}): ${error}`);
      }
    } catch (error) {
      console.log(`❌ Bağlantı hatası (${template.name}): ${error.message}`);
    }
  }
  
  console.log("\n🎉 Tamamlandı! 12 şablon eklendi.");
}

addTemplates();
