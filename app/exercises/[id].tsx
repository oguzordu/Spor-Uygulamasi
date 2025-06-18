import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, Stack, Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { popularExercises } from '../data/exercise-library'; // Yeni veri kaynağı
import { Exercise } from '@/types/workout'; // Genel tip

// ID oluşturma fonksiyonu (merkezi veride zaten var, burada gerek kalmadı)
// const createIdFromName = (name: string) => { ... };

// Kas grubu ID'sine göre başlığı ve egzersizleri alan fonksiyon
const getMuscleGroupDetails = (id: string | undefined): { title: string; exercises: Exercise[] } => {
  const groupId = id;
  if (!groupId || !popularExercises[groupId]) {
    return { title: 'Hareketler', exercises: [] };
  }

  let title = 'Hareketler';
  switch (groupId) {
    case 'chest': title = 'Göğüs Hareketleri'; break;
    case 'back': title = 'Sırt Hareketleri'; break;
    case 'shoulders': title = 'Omuz Hareketleri'; break;
    case 'biceps': title = 'Biceps Hareketleri'; break;
    case 'triceps': title = 'Arka Kol Hareketleri'; break;
    case 'forearms': title = 'Ön Kol Hareketleri'; break;
    case 'legs': title = 'Bacak Hareketleri'; break;
    case 'abs': title = 'Karın Hareketleri'; break;
    case 'calves': title = 'Kalf Hareketleri'; break;
    default: title = groupId.charAt(0).toUpperCase() + groupId.slice(1) + ' Hareketleri'; break;
  }

  // Egzersizler zaten ID'li olduğu için tekrar map'lemeye gerek yok
  const exercises = popularExercises[groupId];

  return { title, exercises };
};

export default function MuscleGroupExercisesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { title, exercises } = getMuscleGroupDetails(id);

  const renderExercise = ({ item }: { item: Exercise }) => (
    <Link
      href={{
        pathname: '/exercise-detail/[exerciseId]',
        params: { 
          exerciseId: item.id, 
          name: item.name, 
        }
      }}
      asChild
    >
      <TouchableOpacity style={styles.exerciseContainer}>
        {item.gif_url ? (
          <Image
            source={item.gif_url as any}
            style={styles.gifImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.gifPlaceholder} />
        )}
        <Text style={styles.exerciseName}>{item.name}</Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: title }} />
      {exercises.length > 0 ? (
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text>Bu kas grubu için egzersiz bulunamadı.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 20,
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
    elevation: 2,
  },
  gifPlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: Colors.tabIconDefault,
    borderRadius: 5,
    marginRight: 15,
  },
  gifImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: Colors.tabIconDefault,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  // errorText stili kaldırıldı
}); 