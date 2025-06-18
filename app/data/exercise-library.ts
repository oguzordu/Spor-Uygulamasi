import { Exercise } from '@/types/workout';

const createIdFromName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

const exercisesData: { [key: string]: Omit<Exercise, 'id' | 'body_part'>[] } = {
    chest: [
        { name: 'Barbell Bench Press', gif_url: require('../../assets/gifs/chest/Barbell_Bench_Press.gif'), targetMuscles: ['Göğüs', 'Omuz', 'Triceps'], instructions: 'Sırt üstü uzanın, barı omuz genişliğinden biraz daha geniş tutun, göğsünüze indirin ve yukarı itin.' },
        { name: 'Incline Barbell Bench Press', gif_url: require('../../assets/gifs/chest/Incline_Barbell_Bench_Press.gif'), targetMuscles: ['Üst Göğüs', 'Omuz', 'Triceps'], instructions: 'Eğimli sehpada sırt üstü uzanın, barı göğsünüzün üst kısmına indirin ve yukarı itin.' },
        { name: 'Dumbbell Fly', gif_url: require('../../assets/gifs/chest/Dumbbell_Fly.gif'), targetMuscles: ['Göğüs'], instructions: 'Sırt üstü uzanın, dambılları göğsünüzün üzerinde birleştirin, yanlara doğru açın ve tekrar birleştirin.' },
        { name: 'Push Up', gif_url: require('../../assets/gifs/chest/Push_Up.gif'), targetMuscles: ['Göğüs', 'Omuz', 'Triceps'], instructions: 'Yere yüzüstü uzanın, ellerinizi omuz genişliğinde açın, vücudunuzu düz bir çizgide tutarak yukarı itin.' },
        { name: 'Chest Dips', gif_url: require('../../assets/gifs/chest/Chest_Dips.gif'), targetMuscles: ['Alt Göğüs', 'Triceps'], instructions: 'Paralel barlarda vücudunuzu yukarı itin, göğsünüzü öne eğerek aşağı inin ve tekrar yukarı itin.' },
        { name: 'Cable Crossover', gif_url: require('../../assets/gifs/chest/Cable_Crossover.gif'), targetMuscles: ['Göğüs'], instructions: 'Kablo istasyonunun ortasında durun, kabloları göğsünüzün önünde birleştirin.' },
        { name: 'Decline Barbell Bench Press', gif_url: require('../../assets/gifs/chest/Decline_Barbell_Bench_Press.gif'), targetMuscles: ['Alt Göğüs', 'Triceps'], instructions: 'Aşağı eğimli sehpada sırt üstü uzanın, barı göğsünüzün alt kısmına indirin ve yukarı itin.' },
        { name: 'Pec Deck Fly', gif_url: require('../../assets/gifs/chest/Pec_Deck_Fly.gif'), targetMuscles: ['Göğüs'], instructions: 'Pec-deck makinesine oturun, kolları birleştirerek göğüs kaslarınızı sıkıştırın.' },
        { name: 'Dumbbell Press', gif_url: require('../../assets/gifs/chest/Dumbbell_Press.gif'), targetMuscles: ['Göğüs', 'Omuz', 'Triceps'], instructions: 'Sırt üstü uzanın, dambılları göğüs hizanızda tutun ve yukarı itin.' },
        { name: 'Incline Dumbbell Fly', gif_url: require('../../assets/gifs/chest/Incline_dumbbell_Fly.gif'), targetMuscles: ['Üst Göğüs'], instructions: 'Eğimli sehpada sırt üstü uzanın, dambılları göğsünüzün üzerinde birleştirin, yanlara doğru açın ve tekrar birleştirin.' },
    ],
    back: [
        { name: 'Barbell Deadlift', gif_url: require('../../assets/gifs/back/Barbell-Deadlift.gif'), targetMuscles: ['Sırt', 'Kalça', 'Bacak'], instructions: 'Barı omuz genişliğinde tutun, sırtınızı düz tutarak kalçanızdan ve dizlerinizden bükülerek kaldırın.' },
        { name: 'Pull Up', gif_url: require('../../assets/gifs/back/Pull-up.gif'), targetMuscles: ['Sırt', 'Biceps'], instructions: 'Barı omuz genişliğinden biraz daha geniş tutun, çeneniz barı geçene kadar kendinizi yukarı çekin.' },
        { name: 'Barbell Bent Over Row', gif_url: require('../../assets/gifs/back/Barbell-Bent-Over-Row.gif'), targetMuscles: ['Sırt'], instructions: 'Sırtınız yere paralel olacak şekilde eğilin, barı karın bölgenize doğru çekin.' },
        { name: 'Lat Pulldown', gif_url: require('../../assets/gifs/back/Lat-Pulldown.gif'), targetMuscles: ['Sırt'], instructions: 'Makineye oturun, barı göğsünüze doğru çekin ve sırt kaslarınızı sıkıştırın.' },
        { name: 'T Bar Rows', gif_url: require('../../assets/gifs/back/t-bar-rows.gif'), targetMuscles: ['Orta Sırt'], instructions: 'T-bar makinesinde göğsünüzü ped\'e yaslayın, barı göğsünüze doğru çekin.' },
        { name: 'Dumbbell Row', gif_url: require('../../assets/gifs/back/Dumbbell-Row.gif'), targetMuscles: ['Sırt'], instructions: 'Bir dizinizi ve elinizi sehpaya koyun, dambılı karın bölgenize doğru çekin.' },
        { name: 'Seated Cable Row', gif_url: require('../../assets/gifs/back/Seated-Cable-Row.gif'), targetMuscles: ['Sırt'], instructions: 'Makineye oturun, kabloyu karın bölgenize doğru çekin ve sırt kaslarınızı sıkıştırın.' },
        { name: 'Chin Up', gif_url: require('../../assets/gifs/back/Chin-Up.gif'), targetMuscles: ['Sırt', 'Biceps'], instructions: 'Avuç içleriniz size bakacak şekilde barı tutun, çeneniz barı geçene kadar kendinizi yukarı çekin.' },
        { name: 'Face Pull', gif_url: require('../../assets/gifs/back/Face-Pull.gif'), targetMuscles: ['Arka Omuz', 'Üst Sırt'], instructions: 'Halatı yüzünüze doğru çekerken dirseklerinizi yukarıda ve dışarıda tutun.' },
        { name: 'Rope Straight Arm Pulldown', gif_url: require('../../assets/gifs/back/Rope-Straight-Arm-Pulldown.gif'), targetMuscles: ['Sırt'], instructions: 'Kollarınızı düz tutarak halatı kalçalarınıza doğru çekin.' },
      ],
    shoulders: [
        { name: 'Dumbbell Lateral Raise', gif_url: require('../../assets/gifs/shoulders/Dumbbell-Lateral-Raise.gif'), targetMuscles: ['Omuz'], instructions: 'Dambılları yanlarda tutarak omuz hizasına kadar kaldırın.' },
        { name: 'Two Arm Dumbbell Front Raise', gif_url: require('../../assets/gifs/shoulders/Two-Arm-Dumbbell-Front-Raise.gif'), targetMuscles: ['Ön Omuz'], instructions: 'Dambılları önünüzde tutarak omuz hizasına kadar kaldırın.' },
        { name: 'Rear Delt Machine Flys', gif_url: require('../../assets/gifs/shoulders/Rear-Delt-Machine-Flys.gif'), targetMuscles: ['Arka Omuz'], instructions: 'Makinede kolları geriye doğru açarak arka omuz kaslarınızı sıkıştırın.' },
        { name: 'Arnold Press', gif_url: require('../../assets/gifs/shoulders/Arnold-Press.gif'), targetMuscles: ['Omuz'], instructions: 'Dambılları avuç içleriniz size bakacak şekilde başlayın, yukarı iterken avuç içlerinizi dışarı çevirin.' },
        { name: 'Dumbbell Shoulder Press', gif_url: require('../../assets/gifs/shoulders/Dumbbell-Shoulder-Press.gif'), targetMuscles: ['Omuz', 'Triceps'], instructions: 'Oturarak veya ayakta, dambılları omuz hizasında tutun ve yukarı itin.' },
        { name: 'Barbell Standing Overhead Press', gif_url: require('../../assets/gifs/shoulders/Barbell-Standing-Overhead-Press.gif'), targetMuscles: ['Omuz', 'Triceps'], instructions: 'Barı göğüs hizanızdan başınızın üzerine doğru itin.' },
        { name: 'Cable Upright Row', gif_url: require('../../assets/gifs/shoulders/Cable-Upright-Row.gif'), targetMuscles: ['Omuz', 'Trapez'], instructions: 'Kablo barını çenenize doğru çekin, dirsekleriniz yukarıda olsun.' },
        { name: 'One Arm Cable Lateral Raise', gif_url: require('../../assets/gifs/shoulders/one-arm-Cable-Lateral-Raise.gif'), targetMuscles: ['Omuz'], instructions: 'Tek kolla kabloyu yana doğru omuz hizasına kadar kaldırın.' },
    ],
    biceps: [
        { name: 'Barbell Curl', gif_url: require('../../assets/gifs/biceps/Barbell-Curl.gif'), targetMuscles: ['Biceps'], instructions: 'Barı omuz genişliğinde tutun, dirseklerinizi sabit tutarak yukarı kaldırın.' },
        { name: 'Dumbbell Curl', gif_url: require('../../assets/gifs/biceps/Dumbbell-Curl.gif'), targetMuscles: ['Biceps'], instructions: 'Dambılları avuç içleriniz yukarı bakacak şekilde kaldırın.' },
        { name: 'Hammer Curl', gif_url: require('../../assets/gifs/biceps/Hammer-Curl.gif'), targetMuscles: ['Biceps', 'Ön Kol'], instructions: 'Dambılları avuç içleriniz birbirine bakacak şekilde (çekiç tutar gibi) kaldırın.' },
        { name: 'Concentration Curl', gif_url: require('../../assets/gifs/biceps/Concentration-Curl.gif'), targetMuscles: ['Biceps'], instructions: 'Oturarak, dirseğinizi dizinizin iç kısmına yaslayın ve dambılı kaldırın.' },
        { name: 'Lever Preacher Curl', gif_url: require('../../assets/gifs/biceps/Lever-Preacher-Curl.gif'), targetMuscles: ['Biceps'], instructions: 'Preacher curl sehpasına kollarınızı yaslayın ve barı kaldırın.' },
        { name: 'Cable Curl', gif_url: require('../../assets/gifs/biceps/cable-curl.gif'), targetMuscles: ['Biceps'], instructions: 'Kablo barını dirseklerinizi sabit tutarak yukarı kaldırın.' },
        { name: 'Z Bar Curl', gif_url: require('../../assets/gifs/biceps/Z-Bar-Curl.gif'), targetMuscles: ['Biceps'], instructions: 'Z-barı kullanarak, bileklerinize daha az baskı uygulayarak curl yapın.' },
        { name: 'Seated Incline Dumbbell Curl', gif_url: require('../../assets/gifs/biceps/Seated-Incline-Dumbbell-Curl.gif'), targetMuscles: ['Biceps'], instructions: 'Eğimli sehpada oturarak, kollarınızı tamamen açarak dambılları kaldırın.' },
        { name: 'Seated Zottman Curl', gif_url: require('../../assets/gifs/biceps/Seated-Zottman-Curl.gif'), targetMuscles: ['Biceps', 'Ön Kol'], instructions: 'Kaldırırken avuç içi yukarı, indirirken avuç içi aşağı bakacak şekilde curl yapın.' },
    ],
    triceps: [
        { name: 'Pushdown', gif_url: require('../../assets/gifs/triceps/Pushdown.gif'), targetMuscles: ['Triceps'], instructions: 'Kablo barını aşağı doğru itin, dirseklerinizi sabit tutun.' },
        { name: 'Barbell Lying Back Of The Head Tricep Extension', gif_url: require('../../assets/gifs/triceps/Barbell-Lying-Back-of-the-Head-Tricep-Extension.gif'), targetMuscles: ['Triceps'], instructions: 'Sırt üstü uzanın, barı alnınıza veya başınızın arkasına doğru indirin.' },
        { name: 'Bench Dips', gif_url: require('../../assets/gifs/triceps/Bench-Dips.gif'), targetMuscles: ['Triceps'], instructions: 'Ellerinizi bir sehpanın kenarına koyun, vücudunuzu aşağı indirip yukarı itin.' },
        { name: 'Dumbbell Kickback', gif_url: require('../../assets/gifs/triceps/Dumbbell-Kickback.gif'), targetMuscles: ['Triceps'], instructions: 'Eğilerek, dambılı geriye doğru itin ve tricepsinizi sıkıştırın.' },
        { name: 'Cable Rope Overhead Triceps Extension', gif_url: require('../../assets/gifs/triceps/Cable-Rope-Overhead-Triceps-Extension.gif'), targetMuscles: ['Triceps'], instructions: 'Halatı başınızın üzerinden yukarı doğru itin.' },
        { name: 'Diamond Push Up', gif_url: require('../../assets/gifs/triceps/Diamond-Push-up.gif'), targetMuscles: ['Triceps', 'Göğüs'], instructions: 'Ellerinizi elmas şeklinde birleştirerek şınav çekin.' },
        { name: 'One Arm Triceps Pushdown', gif_url: require('../../assets/gifs/triceps/One-arm-triceps-pushdown.gif'), targetMuscles: ['Triceps'], instructions: 'Tek kolla kabloyu aşağı doğru itin, dirseğinizi sabit tutun.' },
    ],
    forearms: [
        { name: 'Barbell Wrist Curl', gif_url: require('../../assets/gifs/forearms/barbell-Wrist-Curl.gif'), targetMuscles: ['Ön Kol'], instructions: 'Bileklerinizi dizlerinizin üzerine koyun, barı yukarı doğru kıvırın.' },
        { name: 'Barbell Reverse Wrist Curl', gif_url: require('../../assets/gifs/forearms/Barbell-Reverse-Wrist-Curl.gif'), targetMuscles: ['Ön Kol'], instructions: 'Bileklerinizi dizlerinizin üzerine koyun, avuç içleriniz aşağı bakacak şekilde barı kaldırın.' },
        { name: 'Seated Hammer Curl', gif_url: require('../../assets/gifs/forearms/Seated-Hammer-Curl.gif'), targetMuscles: ['Ön Kol', 'Biceps'], instructions: 'Oturarak, dambılları çekiç tutar gibi kaldırın.' },
        { name: 'Barbell Reverse Curl', gif_url: require('../../assets/gifs/forearms/Barbell-Reverse-Curl.gif'), targetMuscles: ['Ön Kol', 'Biceps'], instructions: 'Avuç içleriniz aşağı bakacak şekilde barı kaldırın.' },
        { name: 'Dumbbell Wrist Curl', gif_url: require('../../assets/gifs/forearms/Dumbbell-Wrist-Curl.gif'), targetMuscles: ['Ön Kol'], instructions: 'Tek dambıl ile bileklerinizi yukarı doğru kıvırın.' },
        { name: 'Dumbbell Reverse Curl', gif_url: require('../../assets/gifs/forearms/dumbbell-reverse-curl.gif'), targetMuscles: ['Ön Kol', 'Biceps'], instructions: 'Tek dambıl ile avuç içiniz aşağı bakacak şekilde kaldırın.' },
      ],
    legs: [
        { name: 'Barbell Squat', gif_url: require('../../assets/gifs/legs/BARBELL-SQUAT.gif'), targetMuscles: ['Bacak', 'Kalça'], instructions: 'Barı sırtınıza alın, omuz genişliğinde durun, sandalyeye oturur gibi çömelin.' },
        { name: 'Front Squat', gif_url: require('../../assets/gifs/legs/front-squat.gif'), targetMuscles: ['Ön Bacak', 'Kalça'], instructions: 'Barı omuzlarınızın önünde tutarak çömelin.' },
        { name: 'Barbell Romanian Deadlift', gif_url: require('../../assets/gifs/legs/Barbell-Romanian-Deadlift.gif'), targetMuscles: ['Arka Bacak', 'Kalça'], instructions: 'Dizlerinizi hafif bükülü tutarak, barı bacaklarınız boyunca aşağı indirin.' },
        { name: 'Leg Press', gif_url: require('../../assets/gifs/legs/Leg-Press.gif'), targetMuscles: ['Bacak'], instructions: 'Makinede ayaklarınızı platforma yerleştirin ve itin.' },
        { name: 'Dumbbell Bulgarian Split Squat', gif_url: require('../../assets/gifs/legs/Dumbbell-Bulgarian-Split-Squat.gif'), targetMuscles: ['Bacak', 'Kalça'], instructions: 'Bir ayağınızı arkanızdaki sehpaya koyun, öndeki bacağınızla çömelin.' },
        { name: 'Leg Extension', gif_url: require('../../assets/gifs/legs/LEG-EXTENSION.gif'), targetMuscles: ['Ön Bacak'], instructions: 'Makinede bacaklarınızı yukarı doğru uzatın.' },
        { name: 'Seated Leg Curl', gif_url: require('../../assets/gifs/legs/Seated-Leg-Curl.gif'), targetMuscles: ['Arka Bacak'], instructions: 'Makinede bacaklarınızı topuklarınıza doğru kıvırın.' },
        { name: 'Hip Adduction Machine', gif_url: require('../../assets/gifs/legs/HIP-ADDUCTION-MACHINE.gif'), targetMuscles: ['İç Bacak'], instructions: 'Makinede bacaklarınızı birleştirerek iç bacak kaslarınızı çalıştırın.' },
        { name: 'Hip Abduction Machine', gif_url: require('../../assets/gifs/legs/HiP-ABDUCTION-MACHINE.gif'), targetMuscles: ['Dış Bacak', 'Kalça'], instructions: 'Makinede bacaklarınızı yanlara doğru açarak dış bacak kaslarınızı çalıştırın.' },
        { name: 'Lever Standing Leg Raise', gif_url: require('../../assets/gifs/legs/Lever-Standing-Leg-Raise.gif'), targetMuscles: ['Kalça'], instructions: 'Makinede tek bacağınızı geriye doğru kaldırın.' },
        { name: 'Bodyweight Sumo Squat', gif_url: require('../../assets/gifs/legs/BODYWEIGHT-SUMO-SQUAT.gif'), targetMuscles: ['İç Bacak', 'Kalça'], instructions: 'Ayaklarınızı omuz genişliğinden daha fazla açarak çömelin.' },
        { name: 'Lever Side Hip Abduction', gif_url: require('../../assets/gifs/legs/Lever-Side-Hip-Abduction.gif'), targetMuscles: ['Dış Bacak', 'Kalça'], instructions: 'Makinede tek bacağınızı yana doğru kaldırın.' },
        { name: 'Sled Hack Squat', gif_url: require('../../assets/gifs/legs/Sled-Hack-Squat.gif'), targetMuscles: ['Bacak', 'Kalça'], instructions: 'Hack squat makinesinde omuzlarınızı pedlere yaslayarak çömelin.' },
        { name: 'Leg Curl', gif_url: require('../../assets/gifs/legs/Leg-Curl.gif'), targetMuscles: ['Arka Bacak'], instructions: 'Yüzüstü yatarak makinede bacaklarınızı topuklarınıza doğru kıvırın.' },
        { name: 'Dumbbell Lunges', gif_url: require('../../assets/gifs/legs/dumbbell-lunges.gif'), targetMuscles: ['Bacak', 'Kalça'], instructions: 'Dambıllarla öne doğru bir adım atın ve çömelin.' },
        { name: 'Smith Machine Squat', gif_url: require('../../assets/gifs/legs/smith-machine-squat.gif'), targetMuscles: ['Bacak', 'Kalça'], instructions: 'Smith makinesinde barı sırtınıza alarak çömelin.' },
    ],
    abs: [
        { name: 'Plank', gif_url: require('../../assets/gifs/abs/plank.gif'), targetMuscles: ['Karın'], instructions: 'Dirsekleriniz ve ayak parmaklarınız üzerinde vücudunuzu düz bir çizgide tutun.' },
        { name: 'Crunch', gif_url: require('../../assets/gifs/abs/Crunch.gif'), targetMuscles: ['Karın'], instructions: 'Sırt üstü uzanın, üst vücudunuzu dizlerinize doğru kaldırın.' },
        { name: 'Russian Twist', gif_url: require('../../assets/gifs/abs/Russian-Twist.gif'), targetMuscles: ['Yan Karın'], instructions: 'Oturur pozisyonda, gövdenizi bir yandan diğerine döndürün.' },
        { name: 'Bicycle Crunch', gif_url: require('../../assets/gifs/abs/Bicycle-Crunch.gif'), targetMuscles: ['Karın', 'Yan Karın'], instructions: 'Sırt üstü uzanarak bisiklet çevirme hareketi yapın, dirseğinizi karşı dizinize değdirin.' },
        { name: 'Cross Body Mountain Climber', gif_url: require('../../assets/gifs/abs/Cross-Body-Mountain-Climber.gif'), targetMuscles: ['Karın', 'Yan Karın'], instructions: 'Şınav pozisyonunda, dizlerinizi çapraz şekilde karşı dirseğinize çekin.' },
        { name: 'Lying Knee Raise', gif_url: require('../../assets/gifs/abs/Lying-Knee-Raise.gif'), targetMuscles: ['Alt Karın'], instructions: 'Sırt üstü uzanın, dizlerinizi bükerek göğsünüze doğru çekin.' },
        { name: 'Cross Crunch', gif_url: require('../../assets/gifs/abs/Cross-Crunch.gif'), targetMuscles: ['Yan Karın'], instructions: 'Sırt üstü uzanın, bir elinizi başınızın arkasına koyun ve dirseğinizi karşı dizinize değdirin.' },
        { name: 'Dead Bug', gif_url: require('../../assets/gifs/abs/Dead-Bug.gif'), targetMuscles: ['Karın'], instructions: 'Sırt üstü uzanın, karşı kol ve bacağınızı aynı anda yavaşça indirin.' },
        { name: 'Lying Leg Raise', gif_url: require('../../assets/gifs/abs/Lying-Leg-Raise.gif'), targetMuscles: ['Alt Karın'], instructions: 'Sırt üstü uzanın, bacaklarınızı düz bir şekilde yukarı kaldırın.' },
    ],
    calves: [
        { name: 'Dumbbell Calf Raise', gif_url: require('../../assets/gifs/calves/Dumbbell-Calf-Raise.gif'), targetMuscles: ['Kalf'], instructions: 'Dambıllarla ayakta durarak parmak uçlarınızda yükselin.' },
        { name: 'Lever Seated Calf Raise', gif_url: require('../../assets/gifs/calves/Lever-Seated-Calf-Raise.gif'), targetMuscles: ['Kalf'], instructions: 'Oturarak makinede kalf kaslarınızı çalıştırın.' },
        { name: 'Donkey Calf Raise', gif_url: require('../../assets/gifs/calves/Donkey-Calf-Raise.gif'), targetMuscles: ['Kalf'], instructions: 'Belinize ağırlık alarak öne eğilin ve parmak uçlarınızda yükselin.' },
        { name: 'Single Leg Calf Raises', gif_url: require('../../assets/gifs/calves/Single-Leg-Calf-Raises.gif'), targetMuscles: ['Kalf'], instructions: 'Tek bacak üzerinde parmak ucunuzda yükselin.' },
    ],
};

export const popularExercises: { [key: string]: Exercise[] } = {};
export default {}

for (const bodyPart in exercisesData) {
  popularExercises[bodyPart] = exercisesData[bodyPart].map(exercise => ({
    ...exercise,
    id: createIdFromName(exercise.name),
    body_part: bodyPart,
  }));
} 