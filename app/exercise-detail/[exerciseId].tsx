import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView // Uzun açıklamalar için
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors'; // Renkler için import

// Statik egzersiz verisini tekrar import veya tanımla (veya merkezi bir yerden al)
// Şimdilik kopyala-yapıştır yapalım, idealde bu veri tek bir yerde olmalı
interface Exercise {
    id?: string; // ID isteğe bağlı yapıldı
    name: string;
    gifPath?: ReturnType<typeof require>;
    targetMuscles?: string[];
    instructions?: string;
}

// ID oluşturma fonksiyonu (önceden tanımlıydı, burada tekrar gösteriliyor)
const createIdFromName = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

// Popüler egzersiz listeleri - Her egzersize ID eklendi
const popularExercises: { [key: string]: { id: string; name: string; gifPath?: ReturnType<typeof require>; targetMuscles?: string[]; instructions?: string }[] } = {
  chest: [
    {
        id: createIdFromName('Barbell Bench Press'),
        name: 'Barbell Bench Press',
        gifPath: require('../../assets/gifs/chest/Barbell_Bench_Press.gif'),
        targetMuscles: ['Göğüs', 'Ön Omuz', 'Arka Kol'],
        instructions: '1. Düz sehpaya sırt üstü uzanın, ayaklar yere düz bassın. Baş, kürek kemikleri ve kalça sehpada kalsın. Karın kasları sıkılı olmalı.\n2. Barı omuz genişliğinden biraz daha geniş tutun (başparmak barı sarsın). Bilekler düz olmalı. Kürek kemiklerinizi geriye çekin.\n3. Nefes alarak barı kontrollü bir şekilde göğsünüze (meme ucu hizasına) indirin. Dirsekler yaklaşık 45 derece açıyla vücuda yakın kalmalı. Göğsünüzde hafif bir gerilme hissedene kadar indirin.\n4. Nefes vererek barı güçlü bir şekilde başlangıç pozisyonuna itin.'
    },
    {
        id: createIdFromName('Incline Barbell Bench Press'),
        name: 'Incline Barbell Bench Press',
        gifPath: require('../../assets/gifs/chest/Incline_Barbell_Bench_Press.gif'),
        targetMuscles: ['Üst Göğüs', 'Ön Omuz', 'Arka Kol'],
        instructions: '1. Eğik (incline) sehpaya sırt üstü uzanın, ayaklar yere düz bassın.\n2. Barı omuz genişliğinden biraz daha geniş tutarak kavrayın. Başparmak barı sarmalı.\n3. Nefes alarak barı yavaşça üst göğsünüze indirin. Dirsekler vücuda hafif açılı olmalı.\n4. Nefes vererek barı başlangıç pozisyonuna güçlü bir şekilde itin.'
    },
    {
        id: createIdFromName('Dumbbell Fly'),
        name: 'Dumbbell Fly',
        gifPath: require('../../assets/gifs/chest/Dumbbell_Fly.gif'),
        targetMuscles: ['Göğüs'],
        instructions: '1. Düz sehpaya sırt üstü uzanın ve iki elinize birer dumbbell alın.\n2. Dumbbell\'ları avuç içleri birbirine bakacak şekilde göğsünüzün üstünde tutun.\n3. Dirseklerde hafif bükülme olacak şekilde dumbbell\'ları yana doğru açarak göğsünüzü esnetin.\n4. Göğüs kaslarınızı sıkarak dumbbell\'ları başlangıç pozisyonuna geri getirin.'
    },
    {
        id: createIdFromName('Push Up'),
        name: 'Push Up',
        gifPath: require('../../assets/gifs/chest/Push_Up.gif'),
        targetMuscles: ['Göğüs', 'Ön Omuz', 'Arka Kol', 'Karın'],
        instructions: '1. Eller omuz genişliğinde yere yerleştirilir, ayak parmak uçları yerde olacak şekilde vücut düz bir çizgi oluşturur.\n2. Nefes alarak göğsü yere doğru indirin, dirsekler vücuda yaklaşık 45 derece açılı olmalı.\n3. Göğsünüz yere çok yaklaşınca nefes vererek vücudu başlangıç pozisyonuna itin.'
    },
    {
        id: createIdFromName('Chest Dips'),
        name: 'Chest Dips',
        gifPath: require('../../assets/gifs/chest/Chest_Dips.gif'),
        targetMuscles: ['Göğüs', 'Arka Kol', 'Ön Omuz'],
        instructions: '1. Paralel barlarda vücudunuzu kollarınızla yukarıda tutun.\n2. Gövdenizi hafifçe öne doğru eğin.\n3. Nefes alarak dirsekleri büküp vücudu aşağı doğru indirin, göğsünüzde gerilme hissedene kadar devam edin.\n4. Nefes vererek kollarınızı düzleştirerek başlangıç pozisyonuna geri dönün.'
    },
    {
        id: createIdFromName('Cable Crossover'),
        name: 'Cable Crossover',
        gifPath: require('../../assets/gifs/chest/Cable_Crossover.gif'),
        targetMuscles: ['Göğüs'],
        instructions: '1. İki kablo makarasının arasına geçin ve kollarınızı hafifçe bükerek kabloları tutun.\n2. Kollar hafifçe bükülü kalacak şekilde kabloları öne doğru, göğsün önünde birleştirin.\n3. Göğüs kaslarınızı sıkarak hareketi tamamlayın.\n4. Kontrollü şekilde kolları açarak başlangıç pozisyonuna dönün.'
    },
    {
        id: createIdFromName('Decline Barbell Bench Press'),
        name: 'Decline Barbell Bench Press',
        gifPath: require('../../assets/gifs/chest/Decline_Barbell_Bench_Press.gif'),
        targetMuscles: ['Alt Göğüs', 'Ön Omuz', 'Arka Kol'],
        instructions: '1. Baş aşağı (decline) sehpaya uzanın ve ayaklarınızı sabitleyin.\n2. Barı omuz genişliğinden biraz daha geniş kavrayın.\n3. Nefes alarak barı kontrollü bir şekilde alt göğsünüze doğru indirin.\n4. Nefes vererek barı güçlü bir şekilde başlangıç pozisyonuna itin.'
    },
    {
        id: createIdFromName('Pec Deck Fly'),
        name: 'Pec Deck Fly',
        gifPath: require('../../assets/gifs/chest/Pec_Deck_Fly.gif'),
        targetMuscles: ['Göğüs'],
        instructions: '1. Pec deck makinesinde sırtınızı dayayın ve kollarınızı kol pedlerine yerleştirin.\n2. Dirsekler hafif bükülü kalacak şekilde kolları öne doğru kapatın.\n3. Göğüs kaslarınızı sıkarak hareketi tamamlayın.\n4. Kontrollü bir şekilde kolları başlangıç pozisyonuna açın.'
    },
    {
        id: createIdFromName('Dumbbell Press'),
        name: 'Dumbbell Press',
        gifPath: require('../../assets/gifs/chest/Dumbbell_Press.gif'),
        targetMuscles: ['Göğüs', 'Ön Omuz', 'Arka Kol'],
        instructions: '1. Düz sehpaya sırt üstü uzanın, her iki elinize birer dumbbell alın.\n2. Dumbbell\'ları göğüs hizasında, avuç içleri ileri bakacak şekilde tutun.\n3. Nefes vererek dumbbell\'ları yukarı itin.\n4. Nefes alarak kontrollü bir şekilde dumbbell\'ları başlangıç pozisyonuna indirin.'
    },
    {
        id: createIdFromName('Incline Dumbbell Fly'),
        name: 'Incline Dumbbell Fly',
        gifPath: require('../../assets/gifs/chest/Incline_dumbbell_Fly.gif'),
        targetMuscles: ['Üst Göğüs'],
        instructions: '1. Eğik (incline) sehpaya sırt üstü uzanın, her iki elinize birer dumbbell alın.\n2. Dumbbell\'ları avuç içleri birbirine bakacak şekilde üst göğsünüzün üstünde tutun.\n3. Dirseklerde hafif bükülme olacak şekilde dumbbell\'ları yana doğru açın.\n4. Göğüs kaslarınızı sıkarak dumbbell\'ları başlangıç pozisyonuna geri getirin.'
    },
],
back: [
  {
      id: createIdFromName('Barbell Deadlift'),
      name: 'Barbell Deadlift',
      gifPath: require('../../assets/gifs/back/Barbell-Deadlift.gif'),
      targetMuscles: ['Alt Sırt', 'Kalça', 'Arka Bacak'],
      instructions: '1. Ayaklarınızı kalça genişliğinde açın, barı ayaklarınızın üzerinde konumlandırın.\n2. Kalçadan bükülerek barı iki elinizle omuz genişliğinde kavrayın. Sırt düz, göğüs yukarıda olmalı.\n3. Nefes alarak kalçayı ve dizleri aynı anda açıp barı yukarı kaldırın.\n4. Üstteyken vücudu tamamen dik konuma getirin. Nefes vererek kontrollü şekilde başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Pull Up'),
      name: 'Pull Up',
      gifPath: require('../../assets/gifs/back/Pull-up.gif'),
      targetMuscles: ['Kanat Kasları', 'Biceps', 'Üst Sırt'],
      instructions: '1. Barı avuç içleri ileri bakacak şekilde omuz genişliğinden biraz daha geniş kavrayın.\n2. Vücudunuzu tam aşağı sarkıtarak başlayın.\n3. Nefes vererek çeneniz barın üzerine çıkana kadar kendinizi yukarı çekin.\n4. Kontrollü bir şekilde nefes alarak başlangıç pozisyonuna inin.'
  },
  {
      id: createIdFromName('Barbell Bent Over Row'),
      name: 'Barbell Bent Over Row',
      gifPath: require('../../assets/gifs/back/Barbell-Bent-Over-Row.gif'),
      targetMuscles: ['Orta Sırt', 'Kanat Kasları', 'Arka Omuz'],
      instructions: '1. Ayaklarınızı omuz genişliğinde açın, barı kavrayın.\n2. Kalçadan bükülerek üst vücudu yere yaklaşık 45 derece eğin. Sırt düz, göğüs yukarıda olmalı.\n3. Nefes vererek barı karın bölgesine doğru çekin.\n4. Sırt kaslarını sıkarak, nefes alarak barı kontrollü şekilde indirin.'
  },
  {
      id: createIdFromName('Lat Pulldown'),
      name: 'Lat Pulldown',
      gifPath: require('../../assets/gifs/back/Lat-Pulldown.gif'),
      targetMuscles: ['Kanat Kasları', 'Biceps', 'Alt Sırt'],
      instructions: '1. Geniş barı avuç içleri ileri bakacak şekilde kavrayın.\n2. Oturarak barı tutun, sırt hafif geride olsun.\n3. Nefes vererek barı çenenizin önüne doğru çekin.\n4. Nefes alarak kontrollü bir şekilde barı başlangıç pozisyonuna bırakın.'
  },
  {
      id: createIdFromName('T Bar Rows'),
      name: 'T Bar Rows',
      gifPath: require('../../assets/gifs/back/t-bar-rows.gif'),
      targetMuscles: ['Orta Sırt', 'Kanat Kasları', 'Trapez'],
      instructions: '1. T-bar aparatını kavrayın ve dizlerden hafif bükülerek üst vücudu öne eğin.\n2. Sırt düz, göğüs yukarıda olacak şekilde pozisyon alın.\n3. Nefes vererek ağırlığı gövdeye doğru çekin.\n4. Sırt kaslarını sıkarak, nefes alarak kontrollü şekilde ağırlığı indirin.'
  },
  {
      id: createIdFromName('Dumbbell Row'),
      name: 'Dumbbell Row',
      gifPath: require('../../assets/gifs/back/Dumbbell-Row.gif'),
      targetMuscles: ['Kanat Kasları', 'Orta Sırt', 'Arka Omuz'],
      instructions: '1. Bir dizinizi ve aynı taraftaki elinizi bir sehpaya yerleştirin.\n2. Diğer elinizle dumbbellı tutun, sırtınızı düz tutun.\n3. Nefes vererek dumbbellı kaburgalarınıza doğru çekin.\n4. Kontrollü şekilde nefes alarak dumbbellı aşağıya indirin.'
  },
  {
      id: createIdFromName('Seated Cable Row'),
      name: 'Seated Cable Row',
      gifPath: require('../../assets/gifs/back/Seated-Cable-Row.gif'),
      targetMuscles: ['Orta Sırt', 'Kanat Kasları', 'Biceps'],
      instructions: '1. Oturur pozisyonda, ayaklarınızı platforma yerleştirin ve kolları uzatarak kabloyu tutun.\n2. Sırtı düz, göğüs yukarıda tutun.\n3. Nefes vererek kabloyu karın hizasına doğru çekin.\n4. Kontrollü bir şekilde nefes alarak kolları uzatarak başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Chin Up'),
      name: 'Chin Up',
      gifPath: require('../../assets/gifs/back/Chin-Up.gif'),
      targetMuscles: ['Biceps', 'Kanat Kasları', 'Üst Sırt'],
      instructions: '1. Barı avuç içleri size bakacak şekilde ve omuz genişliğinde kavrayın.\n2. Vücudunuzu tam aşağı sarkıtarak başlayın.\n3. Nefes vererek çeneniz barın üzerine çıkana kadar kendinizi yukarı çekin.\n4. Kontrollü bir şekilde nefes alarak başlangıç pozisyonuna inin.'
  },
  {
      id: createIdFromName('Face Pull'),
      name: 'Face Pull',
      gifPath: require('../../assets/gifs/back/Face-Pull.gif'),
      targetMuscles: ['Arka Omuz', 'Trapez', 'Üst Sırt'],
      instructions: '1. Kablo makinesinin ip aparatını yüz hizasında ayarlayın.\n2. Avuç içleri birbirine bakacak şekilde ipi kavrayın.\n3. Nefes vererek ipi yüzünüze doğru çekin, dirsekler dışa doğru açılmalı.\n4. Kontrollü bir şekilde nefes alarak ipi başlangıç pozisyonuna bırakın.'
  },
  {
      id: createIdFromName('Rope Straight Arm Pulldown'),
      name: 'Rope Straight Arm Pulldown',
      gifPath: require('../../assets/gifs/back/Rope-Straight-Arm-Pulldown.gif'),
      targetMuscles: ['Kanat Kasları', 'Büyük Sırt Dönüş Kası', 'Triceps'],
      instructions: '1. Ayakta durarak ip aparatını omuz hizasından kavrayın.\n2. Kolları düz tutarak nefes vererek ipi kalça hizasına doğru indirin.\n3. Hareket boyunca kollar düz kalmalı.\n4. Kontrollü şekilde nefes alarak başlangıç pozisyonuna dönün.'
  }
],


shoulders: [
  {
    id: createIdFromName('Lateral Raise'),
    name: 'Lateral Raise',
    gifPath: require('../../assets/gifs/shoulders/Dumbbell-Lateral-Raise.gif'),
    targetMuscles: ['Yan Omuz', 'Üst Omuz'],
    instructions: '1. Ayakta durun, iki elinizde dambıllar olsun.\n2. Kollarınızı yanlara doğru, omuz hizasına kadar kaldırın.\n3. Kısa bir süre bekleyin ve dambılları yavaşça aşağı indirin.'
  },
  {
    id: createIdFromName('Two Arm Dumbbell Front Raise'),
    name: 'Two Arm Dumbbell Front Raise',
    gifPath: require('../../assets/gifs/shoulders/Two-Arm-Dumbbell-Front-Raise.gif'),
    targetMuscles: ['Ön Omuz'],
    instructions: '1. Ayakta durun, dambılları üst bacaklarınızın önünde tutun.\n2. Kollar düz olacak şekilde dambılları öne doğru omuz hizasına kaldırın.\n3. Kontrollü bir şekilde aşağı indirin.'
  },
  {
    id: createIdFromName('Rear Delt Machine Flys'),
    name: 'Rear Delt Machine Flys',
    gifPath: require('../../assets/gifs/shoulders/Rear-Delt-Machine-Flys.gif'),
    targetMuscles: ['Arka Omuz', 'Üst Sırt'],
    instructions: '1. Makineye oturun ve kolları önünüzde tutun.\n2. Kollarınızı yanlara doğru açarak omuz hizasına getirin.\n3. Kaslarınızı sıkıştırdıktan sonra yavaşça başlangıç pozisyonuna dönün.'
  },
  {
    id: createIdFromName('Arnold Press'),
    name: 'Arnold Press',
    gifPath: require('../../assets/gifs/shoulders/Arnold-Press.gif'),
    targetMuscles: ['Ön Omuz', 'Yan Omuz', 'Triceps'],
    instructions: '1. Dambılları avuç içleri size bakacak şekilde omuz hizasında tutun.\n2. Dambılları yukarı iterken kollarınızı dışarı çevirin.\n3. Üstte avuç içleriniz karşıya bakacak.\n4. Kontrollü şekilde başlangıç pozisyonuna dönün.'
  },
  {
    id: createIdFromName('Dumbbell Shoulder Press'),
    name: 'Dumbbell Shoulder Press',
    gifPath: require('../../assets/gifs/shoulders/Dumbbell-Shoulder-Press.gif'),
    targetMuscles: ['Ön Omuz', 'Yan Omuz', 'Triceps'],
    instructions: '1. İki elinizde dambıl, omuz hizasında başlayın.\n2. Dambılları yukarı doğru itin, kollar düz olana kadar.\n3. Yavaşça başlangıç pozisyonuna inin.'
  },
  {
    id: createIdFromName('Barbell Standing Overhead Press'),
    name: 'Barbell Standing Overhead Press',
    gifPath: require('../../assets/gifs/shoulders/Barbell-Standing-Overhead-Press.gif'),
    targetMuscles: ['Omuzlar', 'Triceps', 'Üst Göğüs'],
    instructions: '1. Barı göğüs hizasında kavrayarak başlayın.\n2. Barı başınızın üstüne doğru düz bir çizgide itin.\n3. Kontrollü bir şekilde başlangıç pozisyonuna geri dönün.'
  },
  {
    id: createIdFromName('Cable Upright Row'),
    name: 'Cable Upright Row',
    gifPath: require('../../assets/gifs/shoulders/Cable-Upright-Row.gif'),
    targetMuscles: ['Üst Omuz', 'Trap Kasları'],
    instructions: '1. Kablo istasyonunda barı kavrayın.\n2. Barı çenenize doğru çekin, dirsekler dışarı açılmalı.\n3. Kontrollü şekilde başlangıç pozisyonuna dönün.'
  },
  {
    id: createIdFromName('One Arm Cable Lateral Raise'),
    name: 'One Arm Cable Lateral Raise',
    gifPath: require('../../assets/gifs/shoulders/one-arm-Cable-Lateral-Raise.gif'),
    targetMuscles: ['Yan Omuz'],
    instructions: '1. Kabloyu bir elinizle kavrayın.\n2. Kolunuzu yandan yukarı doğru kaldırın.\n3. Yavaşça aşağıya indirin.'
  },
  {
    id: createIdFromName('Face Pull'),
    name: 'Face Pull',
    gifPath: require('../../assets/gifs/shoulders/Face-Pull.gif'),
    targetMuscles: ['Arka Omuz', 'Üst Sırt', 'Trap Kasları'],
    instructions: '1. Kablo makinesinde ipi kavrayın.\n2. İpi yüzünüze doğru çekin, dirsekler dışa açılmalı.\n3. Kaslarınızı sıkıştırdıktan sonra yavaşça bırakın.'
  },
],


biceps: [
  {
    id: createIdFromName('Barbell Curl'),
    name: 'Barbell Curl',
    gifPath: require('../../assets/gifs/biceps/Barbell-Curl.gif'),
    targetMuscles: ['Biceps Kasları'],
    instructions: '1. Ayaklarınızı omuz genişliğinde açın ve barı avuç içleri yukarı bakacak şekilde kavrayın.\n2. Dirsekleri vücuda sabit tutarak barı yukarı doğru kaldırın.\n3. Biceps kasıldıktan sonra kontrollü şekilde başlangıç pozisyonuna dönün.'
  },
  {
    id: createIdFromName('Dumbbell Curl'),
    name: 'Dumbbell Curl',
    gifPath: require('../../assets/gifs/biceps/Dumbbell-Curl.gif'),
    targetMuscles: ['Biceps Kasları'],
    instructions: '1. Her iki elinize birer dambıl alın, avuç içleri öne baksın.\n2. Dirsekleri sabit tutarak dambılları yukarı doğru kaldırın.\n3. Kontrollü şekilde indirin.'
  },
  {
    id: createIdFromName('Hammer Curl'),
    name: 'Hammer Curl',
    gifPath: require('../../assets/gifs/biceps/Hammer-Curl.gif'),
    targetMuscles: ['Biceps Kasları', 'Brachialis Kasları', 'Brachioradialis Kasları'],
    instructions: '1. Dambılları avuç içleri birbirine bakacak şekilde tutun.\n2. Dirseklerden bükerek dambılları yukarı kaldırın.\n3. Yavaşça başlangıç pozisyonuna dönün.'
  },
  {
    id: createIdFromName('Concentration Curl'),
    name: 'Concentration Curl',
    gifPath: require('../../assets/gifs/biceps/Concentration-Curl.gif'),
    targetMuscles: ['Biceps Kasları'],
    instructions: '1. Bir sandalyeye oturun, bir dambılı dizinizin iç kısmına yaslayın.\n2. Dirseğinizi sabit tutarak dambılı yukarı kaldırın.\n3. Yavaşça indirin ve tekrar edin.'
  },
  {
    id: createIdFromName('Lever Preacher Curl'),
    name: 'Lever Preacher Curl',
    gifPath: require('../../assets/gifs/biceps/Lever-Preacher-Curl.gif'),
    targetMuscles: ['Biceps Kasları'],
    instructions: '1. Preacher curl makinesine yerleşin ve kolunuzu yastığa dayayın.\n2. Barı kavrayıp dirsekten bükerek yukarı kaldırın.\n3. Kontrollü bir şekilde indirin.'
  },
  {
    id: createIdFromName('Cable Curl'),
    name: 'Cable Curl',
    gifPath: require('../../assets/gifs/biceps/cable-curl.gif'),
    targetMuscles: ['Biceps Kasları'],
    instructions: '1. Kablo makinesinde düz barı alt tutuşla kavrayın.\n2. Dirsekleri sabit tutarak barı yukarı çekin.\n3. Yavaşça başlangıç pozisyonuna dönün.'
  },
  {
    id: createIdFromName('Z Bar Curl'),
    name: 'Z Bar Curl',
    gifPath: require('../../assets/gifs/biceps/Z-Bar-Curl.gif'),
    targetMuscles: ['Biceps Kasları'],
    instructions: '1. Z barı avuç içleri yukarı bakacak şekilde kavrayın.\n2. Dirsekleri sabit tutarak barı yukarı doğru kaldırın.\n3. Kasları sıkarak yavaşça indirin.'
  },
  {
    id: createIdFromName('Seated Incline Dumbbell Curl'),
    name: 'Seated Incline Dumbbell Curl',
    gifPath: require('../../assets/gifs/biceps/Seated-Incline-Dumbbell-Curl.gif'),
    targetMuscles: ['Biceps Kasları'],
    instructions: '1. Eğik bir sehpadaki pozisyonda oturun, dambılları elinize alın.\n2. Kollar tamamen aşağı sarkık olsun.\n3. Dirsekleri sabit tutarak dambılları kaldırın ve tekrar indirin.'
  },
  {
    id: createIdFromName('Seated Zottman Curl'),
    name: 'Seated Zottman Curl',
    gifPath: require('../../assets/gifs/biceps/Seated-Zottman-Curl.gif'),
    targetMuscles: ['Biceps Kasları', 'Brachialis Kasları', 'Brachioradialis Kasları'],
    instructions: '1. Oturur pozisyonda dambılları alt tutuşla kavrayın.\n2. Yukarı curl yapın, üstteyken avuç içlerini aşağı çevirin.\n3. Yavaşça dambılları indirin.'
  },
],


triceps: [
  {
      id: createIdFromName('Pushdown'),
      name: 'Pushdown',
      gifPath: require('../../assets/gifs/triceps/Pushdown.gif'),
      targetMuscles: ['Triceps Kasları'],
      instructions: '1. Kablo makinesinde düz barı üstten tutarak kavrayın.\n2. Dirsekleri sabit tutarak barı aşağı doğru itin.\n3. Kontrollü bir şekilde başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Barbell Lying Back Of The Head Tricep Extension'),
      name: 'Barbell Lying Back Of The Head Tricep Extension',
      gifPath: require('../../assets/gifs/triceps/Barbell-Lying-Back-of-the-Head-Tricep-Extension.gif'),
      targetMuscles: ['Triceps Kasları'],
      instructions: '1. Bench üzerinde sırtüstü uzanın ve barbell\'i iki elinizle tutun.\n2. Barı başınızın arkasına doğru indirin.\n3. Kollarınızı düzelterek barı yukarı itin.'
  },
  {
      id: createIdFromName('Bench Dips'),
      name: 'Bench Dips',
      gifPath: require('../../assets/gifs/triceps/Bench-Dips.gif'),
      targetMuscles: ['Triceps Kasları', 'Göğüs Kasları (Pectoralis Major)', 'Ön Omuz Kasları (Anterior Deltoid)'],
      instructions: '1. Bir bench\'in kenarına ellerinizle tutunun ve bacaklarınızı uzatın.\n2. Dirsekleri bükerek vücudu aşağı indirin.\n3. Kollarınızı düzelterek yukarı itin.'
  },
  {
      id: createIdFromName('Dumbbell Kickback'),
      name: 'Dumbbell Kickback',
      gifPath: require('../../assets/gifs/triceps/Dumbbell-Kickback.gif'),
      targetMuscles: ['Triceps Kasları'],
      instructions: '1. Dambılı bir elde tutarak öne eğilin.\n2. Dirseği sabit tutarak dambılı geriye doğru itin.\n3. Kontrollü bir şekilde başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Cable Rope Overhead Triceps Extension'),
      name: 'Cable Rope Overhead Triceps Extension',
      gifPath: require('../../assets/gifs/triceps/Cable-Rope-Overhead-Triceps-Extension.gif'),
      targetMuscles: ['Triceps Kasları'],
      instructions: '1. Kablo makinesinde halat aparatını tutarak başınızın üstünde tutun.\n2. Kolları düz tutarak halatı yukarıya doğru çekin.\n3. Kontrollü bir şekilde başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Diamond Push Up'),
      name: 'Diamond Push Up',
      gifPath: require('../../assets/gifs/triceps/Diamond-Push-up.gif'),
      targetMuscles: ['Triceps Kasları', 'Göğüs Kasları (Pectoralis Major)'],
      instructions: '1. Ellerinizle bir üçgen oluşturacak şekilde yere koyun.\n2. Göğsünüz ellerinize yaklaşana kadar inin.\n3. Kollarınızı düzelterek yukarı itin.'
  },
  {
      id: createIdFromName('Bench Dips'),
      name: 'Bench Dips',
      gifPath: require('../../assets/gifs/triceps/Bench-Dips.gif'),
      targetMuscles: ['Triceps Kasları', 'Göğüs Kasları (Pectoralis Major)', 'Ön Omuz Kasları (Anterior Deltoid)'],
      instructions: '1. Bir bench\'in kenarına ellerinizle tutunun ve bacaklarınızı uzatın.\n2. Dirsekleri bükerek vücudu aşağı indirin.\n3. Kollarınızı düzelterek yukarı itin.'
  },
],


forearms: [
  {
    id: createIdFromName('Barbell Wrist Curl'),
    name: 'Barbell Wrist Curl',
    gifPath: require('../../assets/gifs/forearms/barbell-Wrist-Curl.gif'),
    targetMuscles: ['Ön Kol Flexör Kasları'],
    instructions: '1. Ayaklarınızı omuz genişliğinde açarak bir bench üzerinde oturun ve bileklerinizi barın üzerinde tutarak parmaklarınızı aşağıya doğru sarkıtın.\n2. Nefes vererek bileklerinizi yukarıya doğru kaldırın.\n3. Kontrollü bir şekilde başlangıç pozisyonuna geri dönün. Bu hareket, ön kol kaslarınızın esnemesini ve sıkışmasını sağlar.'
  },
  {
    id: createIdFromName('Barbell Reverse Wrist Curl'),
    name: 'Barbell Reverse Wrist Curl',
    gifPath: require('../../assets/gifs/forearms/Barbell-Reverse-Wrist-Curl.gif'),
    targetMuscles: ['Ön Kol Ekstansör Kasları'],
    instructions: '1. Bench üzerinde oturun ve kollarınızı düz tutarak barı tersten (avucunuz aşağı bakacak şekilde) kavrayın.\n2. Nefes vererek bileklerinizi yukarıya doğru kaldırın.\n3. Kontrollü bir şekilde başlangıç pozisyonuna geri dönün. Bu egzersiz, özellikle ön kolun üst kısmındaki ekstansör kaslarını çalıştırır.'
  },
  {
    id: createIdFromName('Seated Hammer Curl'),
    name: 'Seated Hammer Curl',
    gifPath: require('../../assets/gifs/forearms/Seated-Hammer-Curl.gif'),
    targetMuscles: ['Biceps Kasları', 'Ön Kol Kasları'],
    instructions: '1. Bench üzerine oturun ve her iki elinizde birer dambıl tutun, avuç içleriniz birbirine bakacak şekilde.\n2. Nefes vererek dambılları yukarıya doğru kaldırın, kollarınızın üst kısmı sabit kalsın.\n3. Dambılları kontrollü bir şekilde aşağıya indirin. Bu hareket hem ön kol kaslarını hem de pazu kaslarını çalıştırır.'
  },
  {
    id: createIdFromName('Barbell Reverse Curl'),
    name: 'Barbell Reverse Curl',
    gifPath: require('../../assets/gifs/forearms/Barbell-Reverse-Curl.gif'),
    targetMuscles: ['Ön Kol Ekstansör Kasları', 'Biceps Kasları'],
    instructions: '1. Ayaklarınızı omuz genişliğinde açarak barı tersten kavrayın (avuç içleri aşağı bakacak şekilde).\n2. Nefes vererek bileklerinizi yukarıya doğru kaldırın ve kollarınız sabit kalsın.\n3. Kontrollü bir şekilde başlangıç pozisyonuna dönün. Bu hareket ön kol kaslarının yanı sıra pazu kaslarını da hedefler.'
  },
  {
    id: createIdFromName('Dumbbell Wrist Curl'),
    name: 'Dumbbell Wrist Curl',
    gifPath: require('../../assets/gifs/forearms/Dumbbell-Wrist-Curl.gif'),
    targetMuscles: ['Ön Kol Flexör Kasları'],
    instructions: '1. Bir bench üzerine oturun, kollarınız dizlerinizin üzerinde sabitken her iki elinize birer dambıl alın.\n2. Dambılları avuç içleriniz yukarı bakacak şekilde tutun.\n3. Nefes vererek bileklerinizi yukarıya doğru kaldırın.\n4. Kontrollü bir şekilde aşağıya indirin. Bu hareket, özellikle ön kol kaslarının alt kısmını çalıştırır.'
  },
  {
    id: createIdFromName('Dumbbell Reverse Curl'),
    name: 'Dumbbell Reverse Curl',
    gifPath: require('../../assets/gifs/forearms/dumbbell-reverse-curl.gif'),
    targetMuscles: ['Ön Kol Ekstansör Kasları', 'Biceps Kasları'],
    instructions: '1. Ayaklarınızı omuz genişliğinde açarak her iki elinize birer dambıl alın ve avuç içleriniz aşağı bakacak şekilde tutun.\n2. Nefes vererek dambılları yukarıya doğru kaldırın, bileklerinizin esnemesine dikkat edin.\n3. Kontrollü bir şekilde aşağıya indirin. Bu egzersiz, ön kol kasları ve pazu kaslarını güçlendirir.'
  }
],


legs: [
  {
      id: createIdFromName('Barbell Squat'),
      name: 'Barbell Squat',
      gifPath: require('../../assets/gifs/legs/BARBELL-SQUAT.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Arka Bacak Kasları', 'Kalça Kasları', 'Karın Kasları'],
      instructions: '1. Ayaklar omuz genişliğinde açılır, barı omuzlarınızın arkasına yerleştirin. \n2. Dizlerinizi bükerek kalçanızı geriye doğru itin ve vücudunuzu aşağıya indirin. \n3. Dizlerinizin ayak parmaklarınızı geçmediğinden emin olun. \n4. Güçlü bir şekilde geri kalkın.'
  },
  {
      id: createIdFromName('Front Squat'),
      name: 'Front Squat',
      gifPath: require('../../assets/gifs/legs/front-squat.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Kalça Kasları', 'Karın Kasları'],
      instructions: '1. Barı omuzlarınızın önüne yerleştirin, kollarınızla barı tutun ve ellerinizi barın altına yerleştirin. \n2. Dizlerinizi bükerek kalçanızı geriye doğru itin ve vücudunuzu aşağıya indirin. \n3. Dizlerinizin ayak parmaklarınızı geçmediğinden emin olun. \n4. Başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Barbell Romanian Deadlift'),
      name: 'Barbell Romanian Deadlift',
      gifPath: require('../../assets/gifs/legs/Barbell-Romanian-Deadlift.gif'),
      targetMuscles: ['Arka Bacak Kasları', 'Kalça Kasları', 'Karın Kasları'],
      instructions: '1. Ayaklarınız omuz genişliğinde açık, barı ellerinizle omuz genişliğinde kavrayın. \n2. Dizlerinizi hafif bükerek kalçanızı geriye doğru itin ve vücudunuzu öne doğru eğin. \n3. Sırtınızı düz tutarak barı bacaklarınızın önünden aşağıya indirin. \n4. Kalçalarınızı sıkarak başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Leg Press'),
      name: 'Leg Press',
      gifPath: require('../../assets/gifs/legs/Leg-Press.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Kalça Kasları', 'Arka Bacak Kasları'],
      instructions: '1. Leg press makinesine oturun ve ayaklarınızı platforma yerleştirin. \n2. Dizlerinizi bükerek platformu aşağıya indirin. \n3. Dizlerinizi sıfır derecede bükmeye kadar indirin ve ardından güçlü bir şekilde iterek başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Dumbbell Bulgarian Split Squat'),
      name: 'Dumbbell Bulgarian Split Squat',
      gifPath: require('../../assets/gifs/legs/Dumbbell-Bulgarian-Split-Squat.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Kalça Kasları', 'Arka Bacak Kasları'],
      instructions: '1. Bir bacağınızla arka tarafta bir bench üzerine yerleşin ve ön bacağınızla yere sağlam basın. \n2. Dizlerinizi bükerek vücudunuzu aşağıya indirin. \n3. Ön bacağınızı iterek başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Leg Extension'),
      name: 'Leg Extension',
      gifPath: require('../../assets/gifs/legs/LEG-EXTENSION.gif'),
      targetMuscles: ['Ön Bacak Kasları'],
      instructions: '1. Leg extension makinesine oturun ve ayaklarınızı pedala yerleştirin. \n2. Dizlerinizi düzleştirerek bacaklarınızı yukarıya doğru itin. \n3. Yavaşça başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Seated Leg Curl'),
      name: 'Seated Leg Curl',
      gifPath: require('../../assets/gifs/legs/Seated-Leg-Curl.gif'),
      targetMuscles: ['Arka Bacak Kasları'],
      instructions: '1. Seated leg curl makinesine oturun ve bacaklarınızı pedala yerleştirin. \n2. Dizlerinizi bükerek bacaklarınızı geri doğru çekin. \n3. Yavaşça başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Hip Adduction Machine'),
      name: 'Hip Adduction Machine',
      gifPath: require('../../assets/gifs/legs/HIP-ADDUCTION-MACHINE.gif'),
      targetMuscles: ['İç Bacak Kasları'],
      instructions: '1. Hip adduction makinesine oturun ve bacaklarınızı pedallara yerleştirin. \n2. Bacaklarınızı sıkıca birleştirerek bacaklarınızı birleştirin. \n3. Kontrollü bir şekilde bacaklarınızı açarak başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Hip Abduction Machine'),
      name: 'Hip Abduction Machine',
      gifPath: require('../../assets/gifs/legs/HiP-ABDUCTION-MACHINE.gif'),
      targetMuscles: ['Dış Bacak Kasları'],
      instructions: '1. Hip abduction makinesine oturun ve bacaklarınızı pedallara yerleştirin. \n2. Bacaklarınızı açarak bacaklarınızı dışa doğru itin. \n3. Kontrollü bir şekilde bacaklarınızı birleştirerek başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Lever Standing Leg Raise'),
      name: 'Lever Standing Leg Raise',
      gifPath: require('../../assets/gifs/legs/Lever-Standing-Leg-Raise.gif'),
      targetMuscles: ['Kalça Kasları', 'Kalça Kasları'],
      instructions: '1. Lever standing leg raise makinesine yerleşin ve ayaklarınızı pedallara yerleştirin. \n2. Bir bacağınızı kaldırarak kalçanızı sıkın. \n3. Yavaşça başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Bodyweight Sumo Squat'),
      name: 'Bodyweight Sumo Squat',
      gifPath: require('../../assets/gifs/legs/BODYWEIGHT-SUMO-SQUAT.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Kalça Kasları', 'Arka Bacak Kasları'],
      instructions: '1. Ayaklarınızı genişçe açarak, parmak uçlarınız dışa bakacak şekilde ayaklarınızı yerleştirin. \n2. Dizlerinizi bükerek kalçanızı geriye doğru itin ve vücudunuzu aşağıya indirin. \n3. Güçlü bir şekilde başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Lever Side Hip Abduction'),
      name: 'Lever Side Hip Abduction',
      gifPath: require('../../assets/gifs/legs/Lever-Side-Hip-Abduction.gif'),
      targetMuscles: ['Dış Bacak Kasları'],
      instructions: '1. Lever side hip abduction makinesine yerleşin ve bacaklarınızı pedallara yerleştirin. \n2. Bacağınızı yana doğru kaldırarak dış kaslarınızı sıkın. \n3. Yavaşça başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Sled Hack Squat'),
      name: 'Sled Hack Squat',
      gifPath: require('../../assets/gifs/legs/Sled-Hack-Squat.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Kalça Kasları', 'Arka Bacak Kasları'],
      instructions: '1. Hack squat makinesine yerleşin ve ayaklarınızı platforma yerleştirin. \n2. Dizlerinizi bükerek kalçanızı geriye doğru itin ve vücudunuzu aşağıya indirin. \n3. Dizlerinizi sıfır derecede bükmeye kadar indirin ve ardından güçlü bir şekilde iterek başlangıç pozisyonuna dönün.'
  },
  {
      id: createIdFromName('Leg Curl'),
      name: 'Leg Curl',
      gifPath: require('../../assets/gifs/legs/Leg-Curl.gif'),
      targetMuscles: ['Arka Bacak Kasları'],
      instructions: '1. Leg curl makinesine uzanın ve bacaklarınızı pedala yerleştirin. \n2. Dizlerinizi bükerek bacaklarınızı geri doğru çekin. \n3. Kontrollü bir şekilde başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Dumbbell Lunges'),
      name: 'Dumbbell Lunges',
      gifPath: require('../../assets/gifs/legs/dumbbell-lunges.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Kalça Kasları', 'Arka Bacak Kasları'],
      instructions: '1. Her iki elinize birer dumbbell alarak dik durun. \n2. Bir adım öne atarak dizinizi 90 derece bükün. \n3. Bacağınızı iterek başlangıç pozisyonuna geri dönün.'
  },
  {
      id: createIdFromName('Smith Machine Squat'),
      name: 'Smith Machine Squat',
      gifPath: require('../../assets/gifs/legs/smith-machine-squat.gif'),
      targetMuscles: ['Ön Bacak Kasları', 'Kalça Kasları', 'Arka Bacak Kasları'],
      instructions: '1. Smith makinesine yerleşin ve barı omuzlarınızın üzerine yerleştirin. \n2. Dizlerinizi bükerek kalçanızı geriye doğru itin ve vücudunuzu aşağıya indirin. \n3. Güçlü bir şekilde başlangıç pozisyonuna geri dönün.'
  },
],
    abs: [
    { 
        id: createIdFromName('Plank'), 
        name: 'Plank', 
        gifPath: require('../../assets/gifs/abs/plank.gif'),
        targetMuscles: ['Karın Kasları', 'Alt Sırt Kasları', 'Omuz Kasları'],
        instructions: 'Vücut düz bir çizgi halinde tutulur, karın kasları başta olmak üzere tüm vücut kasları çalışır.'
    },
    { 
        id: createIdFromName('Crunch'), 
        name: 'Crunch', 
        gifPath: require('../../assets/gifs/abs/Crunch.gif'),
        targetMuscles: ['Karın Kasları'],
        instructions: 'Karın kaslarını sıkıştırarak üst beden yukarı doğru kaldırılır. Temel karın egzersizlerinden biridir.'
    },
    { 
        id: createIdFromName('Russian Twist'), 
        name: 'Russian Twist', 
        gifPath: require('../../assets/gifs/abs/Russian-Twist.gif'),
        targetMuscles: ['Karın Kasları', 'Eğik Karın Kasları'],
        instructions: 'Oturarak yapılan bu hareketle gövdeyi sağa ve sola döndürerek karın kasları ve eğik karın kasları çalıştırılır.'
    },
    { 
        id: createIdFromName('Bicycle Crunch'), 
        name: 'Bicycle Crunch', 
        gifPath: require('../../assets/gifs/abs/Bicycle-Crunch.gif'),
        targetMuscles: ['Karın Kasları', 'Eğik Karın Kasları'],
        instructions: 'Bacakları pedal çevirir gibi hareket ettirirken karın kasları sıkıştırılarak çalıştırılır.'
    },
    { 
        id: createIdFromName('Cross Body Mountain Climber'), 
        name: 'Cross Body Mountain Climber', 
        gifPath: require('../../assets/gifs/abs/Cross-Body-Mountain-Climber.gif'),
        targetMuscles: ['Karın Kasları', 'Omuz Kasları', 'Bacak Kasları'],
        instructions: 'Bir dağcı hareketi gibi kolları ve bacakları hızlıca değiştirirken karın kasları, omuzlar ve bacaklar çalışır.'
    },
    { 
        id: createIdFromName('Lying Knee Raise'), 
        name: 'Lying Knee Raise', 
        gifPath: require('../../assets/gifs/abs/Lying-Knee-Raise.gif'),
        targetMuscles: ['Alt Karın Kasları'],
        instructions: 'Sırt üstü yatarak dizler yukarı kaldırılır, alt karın kasları hedeflenir.'
    },
    { 
        id: createIdFromName('Cross Crunch'), 
        name: 'Cross Crunch', 
        gifPath: require('../../assets/gifs/abs/Cross-Crunch.gif'),
        targetMuscles: ['Karın Kasları', 'Eğik Karın Kasları'],
        instructions: 'Vücudu çapraz şekilde bükerek karın ve eğik karın kaslarını çalıştıran bir egzersizdir.'
    },
    { 
        id: createIdFromName('Dead Bug'), 
        name: 'Dead Bug', 
        gifPath: require('../../assets/gifs/abs/Dead-Bug.gif'),
        targetMuscles: ['Karın Kasları', 'Alt Sırt Kasları'],
        instructions: 'Kollar ve bacaklar sırasıyla açılıp kapatılırken karın kasları ve alt sırt kasları çalışır.'
    },
    { 
        id: createIdFromName('Lying Leg Raise'), 
        name: 'Lying Leg Raise', 
        gifPath: require('../../assets/gifs/abs/Lying-Leg-Raise.gif'),
        targetMuscles: ['Alt Karın Kasları'],
        instructions: 'Sırt üstü yatarken bacaklar yukarı kaldırılır, alt karın kasları hedeflenir.'
    },
],
calves: [
  { 
      id: createIdFromName('Dumbbell Calf Raise'), 
      name: 'Dumbbell Calf Raise', 
      gifPath: require('../../assets/gifs/calves/Dumbbell-Calf-Raise.gif'),
      targetMuscles: ['Kalf Kasları'],
      instructions: 'Ağırsız bir şekilde dik durarak, dambıllar ile bacak parmak uçlarına kalkılır ve baldır kasları çalıştırılır.'
  },
  { 
      id: createIdFromName('Lever Seated Calf Raise'), 
      name: 'Lever Seated Calf Raise', 
      gifPath: require('../../assets/gifs/calves/Lever-Seated-Calf-Raise.gif'),
      targetMuscles: ['Kalf Kasları'],
      instructions: 'Oturur pozisyonda, makine kullanılarak baldır kasları çalıştırılır. Dizler sabit tutulur ve ayak parmak uçlarına kalkılır.'
  },
  { 
      id: createIdFromName('Donkey Calf Raise'), 
      name: 'Donkey Calf Raise', 
      gifPath: require('../../assets/gifs/calves/Donkey-Calf-Raise.gif'),
      targetMuscles: ['Kalf Kasları'],
      instructions: 'Eğilerek yapılan bu egzersizle kalça ve baldır kasları hedeflenir. Ağırlık belin üzerine yerleştirilir.'
  },
  { 
      id: createIdFromName('Single Leg Calf Raises'), 
      name: 'Single Leg Calf Raises', 
      gifPath: require('../../assets/gifs/calves/Single-Leg-Calf-Raises.gif'),
      targetMuscles: ['Kalf Kasları'],
      instructions: 'Tek bacak üzerinde yapılan bu egzersizle, her bir baldır kası ayrı ayrı çalıştırılır.'
  },
]
,
};

// ID ile egzersiz bulma fonksiyonu
const findExerciseById = (exerciseId: string | undefined): Exercise | undefined => {
  if (!exerciseId) return undefined;
  for (const groupKey in popularExercises) {
      const group = popularExercises[groupKey];
      // ID'si eşleşen egzersizi bul
      const found = group.find(ex => ex.id === exerciseId);
      if (found) {
          // Gruba ait ID'li tüm egzersizleri döndürmek yerine sadece bulunanı döndür
          return found;
      }
  }
  return undefined;
};

export default function ExerciseDetailScreen() {
  // Sadece exerciseId'yi al, name artık birincil değil
  const { exerciseId, name } = useLocalSearchParams<{ exerciseId: string; name?: string }>();

  // ID ile egzersiz detaylarını bul
  const exerciseDetails = findExerciseById(exerciseId);

  // Başlığı ayarla (önce parametreden gelen adı, yoksa bulunan veriden adı kullan)
  const screenTitle = typeof name === 'string' && name ? name : (exerciseDetails?.name || 'Egzersiz Detayı');

  // Eğer egzersiz bulunamazsa bir mesaj göster
  if (!exerciseDetails) {
    return (
      <View style={styles.container}> 
        <Stack.Screen options={{ title: 'Hata' }} />
        <View style={styles.centerContainer}> 
            <Text>Egzersiz detayları bulunamadı.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: screenTitle }} />

      <View style={styles.gifContainer}>
        {exerciseDetails.gifPath ? (
          <Image source={exerciseDetails.gifPath} style={styles.gif} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderGif}>
            <Text>GIF Bulunamadı</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Çalıştırdığı Bölgeler</Text>
        <Text style={styles.sectionContent}>
          {exerciseDetails.targetMuscles ? exerciseDetails.targetMuscles.join(', ') : 'Bilgi bulunamadı.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nasıl Yapılır?</Text>
        <Text style={styles.sectionContent}>
          {exerciseDetails.instructions || 'Bilgi bulunamadı.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: { // Hata durumu için stil
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gifContainer: { 
    alignItems: 'center', 
    marginVertical: 20, 
  },
  gif: {
    width: '90%', 
    aspectRatio: 1, 
    backgroundColor: 'Colors.tabIconDefault',
    borderRadius: 10, 
  },
  placeholderGif: {
    width: '90%', 
    aspectRatio: 1, 
    backgroundColor: Colors.tabIconDefault,
    borderRadius: 10, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'Colors.primary',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
}); 