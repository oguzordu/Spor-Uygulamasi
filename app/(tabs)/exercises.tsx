import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
// İkonlar için:
// import { Ionicons } from '@expo/vector-icons';
// Animasyonlar için:
import Animated, { FadeIn } from 'react-native-reanimated';

// 1. İkon Yollarını Haritala (require çağrıları burada, statik)
const iconMap = {
  'chest.png': require('../../assets/images/icons/chest.png'),
  'back.png': require('../../assets/images/icons/back.png'),
  'shoulders.png': require('../../assets/images/icons/shoulders.png'),
  'biceps.png': require('../../assets/images/icons/biceps.png'),
  'triceps.png': require('../../assets/images/icons/triceps.png'),
  'forearms.png': require('../../assets/images/icons/forearms.png'),
  'legs.png': require('../../assets/images/icons/legs.png'),
  'abs.png': require('../../assets/images/icons/abs.png'),
  'calves.png': require('../../assets/images/icons/calves.png'),
};

// 2. muscleGroups'da sadece ikon anahtarını (dosya adı) sakla
const muscleGroups = [
  { id: 'abs', name: 'Abs', iconKey: 'abs.png' },
  { id: 'back', name: 'Back', iconKey: 'back.png' },
  { id: 'biceps', name: 'Biceps', iconKey: 'biceps.png' },
  { id: 'calves', name: 'Calves', iconKey: 'calves.png' },
  { id: 'chest', name: 'Chest', iconKey: 'chest.png' },
  { id: 'forearms', name: 'Forearms', iconKey: 'forearms.png' },
  { id: 'legs', name: 'Legs', iconKey: 'legs.png' },
  { id: 'shoulders', name: 'Shoulders', iconKey: 'shoulders.png' },
  { id: 'triceps', name: 'Triceps', iconKey: 'triceps.png' },
];

// Placeholder tipi için tanım
type MuscleGroupItem = { id: string; name: string; iconKey: string };
type PlaceholderItem = { id: string; name: string; iconKey: null }; // iconKey null olabilir
type DisplayItem = MuscleGroupItem | PlaceholderItem;

export default function ExercisesScreen() {
  const isOdd = muscleGroups.length % 2 !== 0;
  // Placeholder için iconKey: null
  const displayMuscleGroups: DisplayItem[] = isOdd
    ? [...muscleGroups, { id: 'placeholder', name: '', iconKey: null }]
    : muscleGroups;

  // 3. renderItem'da item tipini ve Image source'u güncelle
  const renderMuscleGroup = ({ item, index }: { item: DisplayItem, index: number }) => {
    if (item.id === 'placeholder' || item.iconKey === null) {
      return <View style={styles.animatedViewContainer} />;
    }

    // iconMap'ten doğru require sonucunu al
    const iconSource = iconMap[item.iconKey as keyof typeof iconMap];

    return (
      <Animated.View entering={FadeIn.delay(index * 50).duration(300)} style={styles.animatedViewContainer}>
        <Link href={{ pathname: '/exercises/[id]', params: { id: item.id } }} asChild>
          <TouchableOpacity style={styles.cardContainer} activeOpacity={0.7}>
            <Image source={iconSource} style={styles.iconImage} />
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  // SafeAreaView veya normal View kullanımı
  const ContainerComponent = Platform.OS === 'ios' ? SafeAreaView : View;

  return (
    <ContainerComponent style={styles.container}>
      <Text style={styles.title}>Muscle Groups</Text>
      <FlatList
        data={displayMuscleGroups}
        renderItem={renderMuscleGroup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
      />
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 10,
    marginLeft: 20,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  animatedViewContainer: { // Animasyonlu View için sarmalayıcı stili
    flex: 1, // numColumns ile uyumlu olması için
    margin: 8, // cardContainer'dan marjı buraya taşıdık
  },
  cardContainer: {
    flex: 1, // İçeriğin genişlemesi için
    backgroundColor: Colors.white, // Linter hatası düzeltildi, şimdilik beyaz
    // margin: 8, // Marjı animatedViewContainer'a taşıdık
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 130,
  },
  iconImage: { // Image için stil
    width: 50, // İkon boyutu
    height: 50, // İkon boyutu
    marginBottom: 10, // Alt boşluk
    resizeMode: 'contain', // Resmi orantılı sığdır
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
}); 