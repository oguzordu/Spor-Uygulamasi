# GymApp - Final Projesi

Bu depo, bir mobil fitness uygulaması olan GymApp'in final projesi için kaynak kodlarını ve belgelerini içerir.

**Proje Linkleri**
- **GitHub Deposu:** [Buraya GitHub depo linkinizi ekleyin]
- **Tanıtım Videosu:** [Buraya YouTube/Vimeo video linkinizi ekleyin]

---

## Proje Açıklaması

GymApp, kullanıcıların kendi antrenman programlarını oluşturmalarına, mevcut programları takvimlerine eklemelerine ve günlük egzersizlerini takip etmelerine olanak tanıyan bir mobil uygulamadır. Kullanıcılar, geniş bir egzersiz kütüphanesinden seçim yapabilir, programlarını kişiselleştirebilir ve ilerlemelerini kaydedebilirler.

### Bana Söylemek İstedikleriniz (Notlar)

Bu kısım, projeyi geliştirirken karşılaşılan durumlar ve gelecekte yapılabilecek iyileştirmeler hakkında notlar içerir.

- **Geliştirme Süreci:** Projenin geliştirilmesi sırasında, kullanıcı deneyimini (UX) sezgisel ve akıcı hale getirmeye odaklanıldı. Takvim entegrasyonu ve antrenman loglama gibi temel özellikler başarıyla tamamlandı.
- **Yetiştirilemeyen Kısımlar:** Zaman kısıtlamaları nedeniyle, sosyal özellikler (arkadaş ekleme, program paylaşma) veya daha gelişmiş istatistik takibi (grafikler, ilerleme raporları) gibi bazı ikincil özellikler eklenemedi. Bu özellikler, projenin gelecekteki versiyonları için planlanmaktadır.
- **Teknik Not:** Başlangıçta bazı GIF'lerin yüklenmesinde ve kullanıcı oturum yönetiminde karşılaşılan hatalar, kodun yeniden düzenlenmesi ve state yönetimi mantığının iyileştirilmesiyle tamamen giderilmiştir.

---

## Temel Özellikler

- **Kullanıcı Yönetimi:** E-posta/şifre ile kayıt olma ve giriş yapma.
- **Egzersiz Kütüphanesi:** Kas gruplarına göre kategorize edilmiş, animasyonlu GIF'ler içeren zengin bir egzersiz listesi.
- **Program Oluşturma:** Kullanıcılar, egzersiz kütüphanesinden hareketler seçerek kendi antrenman günlerini ve programlarını oluşturabilir.
- **Takvim Entegrasyonu:** Oluşturulan veya seçilen programlar, bir başlangıç tarihi, süre ve dinlenme günleri belirtilerek takvime eklenebilir.
- **Günlük Antrenman Takibi:** Kullanıcılar, takvim üzerinden herhangi bir antrenman gününe tıklayarak o günün egzersizlerini görebilir ve yaptıkları set, tekrar, kilo bilgilerini kaydedebilirler.
- **Dinamik Arayüz:** Kullanıcının oturum durumuna göre arayüz dinamik olarak değişir.

---

## Kullanılan Teknolojiler

- **Frontend:** React Native & Expo
- **Backend & Veritabanı:** Supabase (PostgreSQL)
- **Dil:** TypeScript
- **Navigasyon:** Expo Router
- **UI Bileşenleri:** React Native Calendars, React Native Community DateTimePicker

---

## Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

- Node.js (LTS versiyonu)
- Expo CLI
- Git

### Adımlar

1.  **Depoyu Klonlayın:**
    ```bash
    git clone [SİZİN GİTHUB LİNKİNİZ]
    cd GymApp
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Supabase Kurulumu:**
    Bu proje, backend hizmeti olarak Supabase kullanmaktadır. Supabase, online bir PostgreSQL veritabanı ve kimlik doğrulama hizmetleri sunar.

    -   [supabase.com](https://supabase.com) adresinden ücretsiz bir hesap oluşturun.
    -   Yeni bir proje oluşturun.
    -   Proje ayarlarına gidin (`Project Settings > API`). Orada bulunan **Project URL** ve **Project API Keys** (anon, public key) değerlerini alın.

4.  **Ortam Değişkenlerini Ayarlayın:**
    Projenin ana dizininde `.env` adında bir dosya oluşturun ve içine Supabase'den aldığınız bilgileri aşağıdaki gibi ekleyin:

    ```
    EXPO_PUBLIC_SUPABASE_URL=SİZİN_SUPABASE_URLİNİZ
    EXPO_PUBLIC_SUPABASE_ANON_KEY=SİZİN_SUPABASE_ANON_KEYİNİZ
    ```

5.  **Veritabanı Şemasını Yükleyin:**
    Supabase projenizin `SQL Editor` bölümüne gidin ve bu depoda bulunan `supabase/schema.sql` dosyasının içeriğini kopyalayıp çalıştırın. Bu, gerekli tüm tabloları ve ilişkileri oluşturacaktır.

6.  **Uygulamayı Başlatın:**
    ```bash
    npx expo start
    ```
    Açılan Metro Bundler arayüzünden QR kodu okutarak uygulamayı Expo Go (Android/iOS) üzerinde çalıştırabilirsiniz.

---

## APK Oluşturma

Test edilmiş ve çalışır durumdaki APK'yı oluşturmak için aşağıdaki komutu kullanabilirsiniz. Bu komut, Expo'nun bulut tabanlı derleme hizmeti olan EAS Build'i kullanır.

1.  **EAS CLI Kurulumu (Eğer kurulu değilse):**
    ```bash
    npm install -g eas-cli
    ```

2.  **Expo Hesabınıza Giriş Yapın:**
    ```bash
    eas login
    ```

3.  **Proje Yapılandırması:**
    `eas.json` dosyasının projede mevcut olduğundan emin olun. Eğer yoksa, `eas build:configure` komutu ile oluşturulabilir.

4.  **APK Derlemesi:**
    ```bash
    eas build -p android --profile preview
    ```
    Derleme tamamlandığında, Expo size APK'yı indirebileceğiniz bir link sağlayacaktır.
