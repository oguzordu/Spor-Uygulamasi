import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, FlatList, Modal, TextInput, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface ProgramDetails {
  id: string;
  name: string;
  // İleride eklenecek diğer alanlar: günler, egzersizler vb.
}

// Yeni arayüz: Program Günü
interface ProgramDay {
  id: string;
  program_id: string;
  day_name: string;
  order: number; // Günlerin sıralaması için
  program_exercises: { count: number }[];
}

const isWeb = Platform.OS === 'web';
const dayColors = ['#B5EAD7', '#F7A072', '#A7C7E7', '#FFDAC1', '#C7CEEA', '#F9D29D'];
const dayCardColors = [Colors.white, '#E8F5E9'];

export default function ProgramDetailScreen() {
  const { id: programIdParam } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [programDays, setProgramDays] = useState<ProgramDay[]>([]); // Program günleri için state
  const [loading, setLoading] = useState(true);
  const [loadingDays, setLoadingDays] = useState(false); // Günler için ayrı yükleme durumu

  const [isAddDayModalVisible, setIsAddDayModalVisible] = useState(false); // Modal görünürlüğü
  const [newDayName, setNewDayName] = useState(''); // Yeni gün adı için state
  const [savingDay, setSavingDay] = useState(false); // Gün kaydetme işlemi için yükleme durumu

  useEffect(() => {
    if (!programIdParam) {
      Alert.alert('Hata', 'Program ID bulunamadı.');
      router.replace('/(tabs)/myprogram');
      return;
    }

    const fetchProgramData = async () => {
      setLoading(true);
      try {
        // Program detaylarını çek
        const { data: programData, error: programError } = await supabase
          .from('user_programs')
          .select('id, name')
          .eq('id', programIdParam)
          .single();

        if (programError) {
          console.error('Program detayları çekilirken hata:', programError);
          Alert.alert('Hata', 'Program detayları yüklenirken bir sorun oluştu: ' + programError.message);
          setProgram(null);
          setLoading(false);
          return; // Program çekilemezse devam etme
        }
        
        if (programData) {
          setProgram(programData as ProgramDetails);
          // Program detayları çekildikten sonra günleri çek
          await fetchProgramDays(programData.id);
        } else {
          Alert.alert('Hata', 'Program bulunamadı.');
          setProgram(null);
        }

      } catch (e: any) {
        console.error('Beklenmedik hata (program):', e);
        Alert.alert('Hata', 'Beklenmedik bir sorun oluştu (program): ' + e.message);
        setProgram(null);
      } finally {
        setLoading(false); // Genel yükleme durumu program detayları çekilince biter
      }
    };

    fetchProgramData();
  }, [programIdParam]);

  // Program günlerini çekme fonksiyonu
  const fetchProgramDays = async (currentProgramId: string) => {
    if (!currentProgramId) return;
    setLoadingDays(true);
    try {
      const { data: daysData, error: daysError } = await supabase
        .from('program_days')
        .select('id, program_id, day_name, order, program_exercises(count)')
        .eq('program_id', currentProgramId)
        .order('order', { ascending: true }); // Sıraya göre listele

      if (daysError) {
        console.error('Program günleri çekilirken hata:', daysError);
        Alert.alert('Hata', 'Program günleri yüklenirken bir sorun oluştu: ' + daysError.message);
        setProgramDays([]);
      } else if (daysData) {
        setProgramDays(daysData as ProgramDay[]);
      }
    } catch (e: any) {
      console.error('Beklenmedik hata (günler):', e);
      Alert.alert('Hata', 'Beklenmedik bir sorun oluştu (günler): ' + e.message);
      setProgramDays([]);
    } finally {
      setLoadingDays(false);
    }
  };

  const handleAddDay = async () => {
    if (!newDayName.trim()) {
      Alert.alert('Uyarı', 'Lütfen gün için bir isim girin.');
      return;
    }
    if (!programIdParam) {
        Alert.alert('Hata', 'Program ID bulunamadı. Gün eklenemiyor.');
        return;
    }

    setSavingDay(true);
    try {
      // Mevcut gün sayısını alarak yeni gün için order belirle
      const currentOrder = programDays.length > 0 ? Math.max(...programDays.map(day => day.order)) + 1 : 1;
      
      const { data: newDay, error } = await supabase
        .from('program_days')
        .insert([{ 
            program_id: programIdParam, 
            day_name: newDayName.trim(),
            order: currentOrder
        }])
        .select('id, program_id, day_name, order')
        .single();

      if (error) {
        console.error('Gün eklenirken hata:', error);
        Alert.alert('Hata', 'Gün eklenirken bir sorun oluştu: ' + error.message);
      } else if (newDay) {
        // setProgramDays([...programDays, newDay]); // İsteğe bağlı: hemen ekle
        await fetchProgramDays(programIdParam); // Veya listeyi yeniden çekerek güncelle
        Alert.alert('Başarılı', `'${newDayName.trim()}' günü eklendi.`);
        setNewDayName('');
        setIsAddDayModalVisible(false);
      }
    } catch (e: any) {
      console.error('Gün eklerken beklenmedik hata:', e);
      Alert.alert('Hata', 'Gün eklerken beklenmedik bir sorun oluştu: ' + e.message);
    } finally {
      setSavingDay(false);
    }
  };

  const handleDeleteDay = async (dayId: string, dayName: string) => {
    Alert.alert(
      `'${dayName}' Silinecek`,
      "Bu günü ve içindeki tüm hareketleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Güne ait tüm egzersiz kayıtlarını sil
              const { error: exercisesError } = await supabase
                .from('program_exercises')
                .delete()
                .eq('day_id', dayId);
              
              if (exercisesError) throw exercisesError;

              // 2. Egzersizler silindikten sonra günü sil
              const { error: dayError } = await supabase
                .from('program_days')
                .delete()
                .eq('id', dayId);

              if (dayError) throw dayError;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setProgramDays(prevDays => prevDays.filter(d => d.id !== dayId));

            } catch (error: any) {
              console.error('Gün silinirken hata:', error);
              Alert.alert('Hata', 'Gün silinirken bir hata oluştu: ' + error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) { // Sadece ana program bilgisi yüklenirken göster
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Program bilgileri yüklenemedi veya bulunamadı.</Text>
        {
          router.canGoBack() ? 
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Geri Dön</Text>
          </TouchableOpacity> : 
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/myprogram')}>
            <Text style={styles.buttonText}>Programlarıma Dön</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  const renderDayItem = (info: { item: ProgramDay, index: number }) => {
    const { item, index } = info;
    const backgroundColor = dayCardColors[index % 2];
    const DayItem = isWeb ? View : Animated.View;
    const itemProps = isWeb ? {} : { entering: FadeIn };
    const exerciseCount = item.program_exercises[0]?.count ?? 0;
    const itemStyle = {
      ...styles.dayItemContainer,
      backgroundColor
    };

    return (
      <DayItem style={itemStyle} {...itemProps}>
        <TouchableOpacity 
          style={styles.dayItemContent}
          onPress={() => router.push({
            pathname: '/day-exercises/[dayId]',
            params: { dayId: item.id, dayName: item.day_name, programId: programIdParam } 
          })}
          activeOpacity={0.85}
        >
          <View style={styles.dayIconCircle}>
          <Ionicons name="calendar-outline" size={24} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayNameText}>{item.day_name}</Text>
            <Text style={styles.dayExercisesCount}>{exerciseCount} hareket</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteDay(item.id, item.day_name)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </DayItem>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: program.name || 'Program Detayı' }} />
      <Text style={styles.programName}>{program.name}</Text>
      
      <Text style={styles.sectionTitle}>Program Günleri</Text>

      {loadingDays ? (
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }}/>
      ) : programDays.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="sunny-outline" size={70} color={Colors.secondary} style={{ marginBottom: 18 }} />
          <Text style={styles.emptyMessage}>Bu programa henüz gün eklenmemiş.</Text>
          <Text style={styles.emptyTextSmall}>Hemen bir gün ekleyin ve antrenmanınızı planlamaya başlayın!</Text>
        </View>
      ) : (
        <FlatList
          data={programDays}
          renderItem={renderDayItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.daysList}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
      
      {/* Yeni Gün Ekle butonu */}
      <Animated.View entering={FadeIn} style={styles.fabWrapper}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setIsAddDayModalVisible(true);
            if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={28} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.fabText}>Yeni Gün Ekle</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Yeni Gün Ekleme Modalı */}
      <Modal
        animationType={isWeb ? "slide" : "none"}
        transparent={true}
        visible={isAddDayModalVisible}
        onRequestClose={() => {
          if (!savingDay) {
            setIsAddDayModalVisible(false);
            setNewDayName('');
          }
        }}
      >
        {isWeb ? (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Yeni Gün Ekle</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Örn: 1. Gün - Göğüs & Biceps"
                value={newDayName}
                onChangeText={setNewDayName}
                placeholderTextColor={Colors.tabIconDefault}
              />
              {savingDay ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                  <View style={styles.modalButtonContainer}>
                      <TouchableOpacity 
                          style={[styles.modalButton, styles.modalCancelButton]} 
                          onPress={() => {
                              setIsAddDayModalVisible(false);
                              setNewDayName('');
                          }}>
                          <Text style={styles.modalButtonText}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={[styles.modalButton, styles.modalSaveButton]} 
                          onPress={handleAddDay}>
                          <Text style={styles.modalButtonText}>Kaydet</Text>
                      </TouchableOpacity>
                  </View>
              )}
            </View>
          </View>
        ) : (
          <BlurView intensity={40} tint="light" style={styles.modalOverlay}>
            <Animated.View entering={FadeIn} style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Yeni Gün Ekle</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Örn: 1. Gün - Göğüs & Biceps"
                value={newDayName}
                onChangeText={setNewDayName}
                placeholderTextColor={Colors.tabIconDefault}
              />
              {savingDay ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                  <View style={styles.modalButtonContainer}>
                      <TouchableOpacity 
                          style={[styles.modalButton, styles.modalCancelButton]} 
                          onPress={() => {
                              setIsAddDayModalVisible(false);
                              setNewDayName('');
                          }}>
                          <Text style={styles.modalButtonText}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={[styles.modalButton, styles.modalSaveButton]} 
                          onPress={() => {
                            handleAddDay();
                            if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          }}>
                          <Text style={styles.modalButtonText}>Kaydet</Text>
                      </TouchableOpacity>
                  </View>
              )}
            </Animated.View>
          </BlurView>
        )}
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  programName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15, // Azaltıldı
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22, // Biraz büyütüldü
    fontWeight: '600',
    color: Colors.text,
    marginTop: 10, // Azaltıldı
    marginBottom: 15, // Artırıldı
  },
  errorText: {
    fontSize: 16,
    color: Colors.text, 
    textAlign: 'center',
    marginBottom: 20,
  },
  button: { // Genel buton stili (Geri Dön / Programlarıma Dön)
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { // Genel buton metin stili
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Gün listesi için stiller
  daysList: {
    marginBottom: 20,
  },
  dayItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    marginBottom: 14,
    padding: 0,
    shadowColor: Colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    minHeight: 72,
    position: 'relative',
  },
  dayItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  dayIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    shadowColor: Colors.primary,
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 2,
  },
  dayNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  dayExercisesCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyMessage: {
    textAlign: 'center',
    color: Colors.tabIconDefault,
    fontSize: 16,
    marginVertical: 30,
  },
  emptyTextSmall: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  // Yeni Gün Ekle butonu
  fabWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    alignItems: 'center',
    zIndex: 10,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    backgroundColor: Colors.background, // Input arka planı
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 25,
    color: Colors.text,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1, // Butonların eşit yer kaplaması için
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5, // Butonlar arası boşluk
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
  },
  modalCancelButton: {
    backgroundColor: Colors.tabIconDefault, // Veya başka bir renk
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
    zIndex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 15,
  },
}); 