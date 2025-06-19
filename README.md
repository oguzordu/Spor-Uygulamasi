# GymApp Projesi

Bu proje, kullanıcıların kendi antrenman programlarını oluşturmasına, mevcut programları takip etmesine ve geniş bir egzersiz kütüphanesinden faydalanmasına olanak tanıyan bir mobil fitness uygulamasıdır. React Native ve Expo ile geliştirilmiştir.

## Proje Açıklaması

Uygulama, kullanıcıların kas gruplarına göre ayrılmış egzersizleri incelemesine, bu egzersizleri kullanarak kendi kişisel antrenman programlarını ve günlerini oluşturmasına olanak tanır. Oluşturulan programlar kaydedilir ve daha sonra tekrar kullanılabilir.

## Özellikler

-   **Egzersiz Kütüphanesi:** Vücut bölgelerine göre kategorize edilmiş zengin egzersiz arşivi.
-   **Program Oluşturma:** Kullanıcıların kendi antrenman programlarını ve günlük rutinlerini oluşturabilmesi.
-   **Program Takibi:** Oluşturulan programların ve günlerin detaylarını görüntüleme.
-   **Egzersiz Yönetimi:** Günlere yeni egzersiz ekleme, mevcut egzersizleri düzenleme ve silme.
-   **Modern Arayüz:** Kullanıcı dostu ve modern bir tasarıma sahiptir.

## Kullanılan Teknolojiler

-   **Frontend:** React Native, Expo
-   **UI:** React Navigation, Expo Router
-   **Backend & Veritabanı:** Supabase (PostgreSQL)
-   **Dil:** TypeScript

## Veritabanı Kurulumu

Bu proje, bulut tabanlı bir servis olan **Supabase** kullanmaktadır. Bu nedenle, projenin çalışması için yerel bir veritabanı kurulumuna ihtiyaç yoktur. Gerekli tüm veritabanı şeması ve konfigürasyon bilgileri Supabase projesi üzerinde yönetilmektedir.

Giriş için gerekli `anon key` ve `URL` bilgileri `utils/supabase.ts` dosyası içerisinde mevcuttur. Projeyi klonladıktan sonra `npm install` komutu ile bağımlılıkları kurup `npx expo start` ile direkt olarak çalıştırabilirsiniz.

## Hocama Notlar

-   Projenin temel iskeleti ve fonksiyonları tamamlanmıştır.
-   Gelecek geliştirmeler olarak kullanıcı girişi (authentication) ve her set/tekrar sonrası ilerlemeyi kaydedecek bir takip sistemi eklenebilir.
-   Tasarım konusunda daha detaylı iyileştirmeler yapılabilir.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
