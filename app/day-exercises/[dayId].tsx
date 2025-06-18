import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '@/types/workout';
import { popularExercises } from '@/app/data/exercise-library';

// Bu sayfaya özel, join ile gelen detaylı egzersiz tipi
interface DetailedProgramExercise extends Exercise {
  day_id: string;
  order: number;
  kilo?: number | null;
  notes?: string | null;
}

const iconMap: { [key: string]: any } = {
  'Abs': require('../../assets/images/icons/abs.png'),
  'Back': require('../../assets/images/icons/back.png'),
  'Biceps': require('../../assets/images/icons/biceps.png'),
  'Calves': require('../../assets/images/icons/calves.png'),
  'Chest': require('../../assets/images/icons/chest.png'),
  'Forearms': require('../../assets/images/icons/forearms.png'),
  'Legs': require('../../assets/images/icons/legs.png'),
  'Shoulders': require('../../assets/images/icons/shoulders.png'),
  'Triceps': require('../../assets/images/icons/triceps.png'),
  'Default': require('../../assets/images/icons/chest.png'), // fallback, istediğini koy
};

const getIconForBodyPart = (bodyPart?: string) => {
  if (!bodyPart) return iconMap['Default'];
  // Normalize: baştaki/sondaki boşlukları sil, ilk harfi büyük yap, diğerleri küçük
  const normalized = bodyPart.trim().charAt(0).toUpperCase() + bodyPart.trim().slice(1).toLowerCase();
  return iconMap[normalized] || iconMap['Default'];
};

// Metinleri büyük harfe çeviren yardımcı fonksiyon
const capitalize = (s: string) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

const popularShortcuts = [
    { sets: '3', reps: '12', label: '3x12' },
    { sets: '4', reps: '8', label: '4x8' },
    { sets: '3', reps: '15', label: '3x15' },
    { sets: '4', reps: '12', label: '4x12' },
    { sets: '4', reps: '15', label: '4x15' },
    { sets: '3', reps: '8', label: '3x8' },
];

const isWeb = Platform.OS === 'web';

export default function DayExercisesScreen() {
  const { dayId, dayName, programId } = useLocalSearchParams<{
    dayId: string;
    dayName?: string;
    programId?: string;
  }>();
  const router = useRouter();

  const [exercises, setExercises] = useState<DetailedProgramExercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  
  const [isAddExerciseModalVisible, setIsAddExerciseModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'selectBodyPart' | 'selectExercise' | 'enterDetails'>('selectBodyPart');
  
  const [allExercisesFromDB, setAllExercisesFromDB] = useState<Exercise[]>([]);
  const [loadingAllExercises, setLoadingAllExercises] = useState(false);
  
  const availableBodyParts = useMemo(() => {
    if (allExercisesFromDB.length === 0) return [];
    const parts = [...new Set(allExercisesFromDB.map((ex) => ex.body_part).filter(Boolean) as string[])];
    return parts.sort();
  }, [allExercisesFromDB]);
  
  const [selectedBodyPartInModal, setSelectedBodyPartInModal] = useState<string | null>(null);
  const [exercisesForSelectedBodyPart, setExercisesForSelectedBodyPart] = useState<Exercise[]>([]);
  const [selectedExerciseFromList, setSelectedExerciseFromList] = useState<Exercise | null>(null);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');

  const [newExerciseSets, setNewExerciseSets] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('');
  const [newExerciseKilo, setNewExerciseKilo] = useState('');
  const [newExerciseNotes, setNewExerciseNotes] = useState('');
  const [savingExercise, setSavingExercise] = useState(false);
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  // Düzenleme Modalı için state'ler
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<DetailedProgramExercise | null>(null);
  const [editSets, setEditSets] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editKilo, setEditKilo] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Bu animasyon sadece ana "ekle" modalı için geçerli
    const modalVisible = isAddExerciseModalVisible || isEditModalVisible;
    if (modalVisible) {
      modalScale.value = withSpring(1, { damping: 12, stiffness: 90 });
      modalOpacity.value = withSpring(1);
    } else {
      modalScale.value = withSpring(0.8);
      modalOpacity.value = withSpring(0);
    }
  }, [isAddExerciseModalVisible, isEditModalVisible]);

  const modalAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const fetchAllExercisesFromDB = async () => {
    if (loadingAllExercises || allExercisesFromDB.length > 0) return;
    setLoadingAllExercises(true);
    try {
      const { data, error } = await supabase.from('exercises_list').select('*');
      if (error) throw error;
      if (data) {
        setAllExercisesFromDB(data);
      }
    } catch (e: any) {
      console.error('Tüm egzersizler çekilirken hata:', e);
      Alert.alert('Hata', 'Egzersiz kütüphanesi yüklenirken bir sorun oluştu.');
    } finally {
      setLoadingAllExercises(false);
    }
  };

  useEffect(() => {
    if (!dayId) {
      Alert.alert('Hata', 'Gün ID bulunamadı.');
      if (programId) router.replace({ pathname: '/program-detail/[id]', params: { id: programId } });
      else router.replace('/(tabs)/myprogram');
      return;
    }
    fetchExercises();
  }, [dayId]);

  const fetchExercises = async () => {
    if (!dayId) return;
    setLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from('program_exercises')
        .select('*, exercises_list(*)')
        .eq('day_id', dayId)
        .order('order', { ascending: true });

      if (error) throw error;
      
      if (data) {
        const formattedExercises = data.map((item: any) => ({
          ...item.exercises_list,
          ...item,
          id: item.id,
          name: item.exercises_list?.name || 'İsimsiz Egzersiz',
        })) as DetailedProgramExercise[];
        setExercises(formattedExercises);
      }
    } catch (e: any) {
      Alert.alert('Hata', `Egzersizler yüklenirken bir sorun oluştu.`);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleSelectBodyPart = (bodyPart: string) => {
    setSelectedBodyPartInModal(bodyPart);
    const exercisesForPart = allExercisesFromDB.filter((ex) => ex.body_part === bodyPart);
    setExercisesForSelectedBodyPart(exercisesForPart);
    setModalStep('selectExercise');
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExerciseFromList(exercise);
    setModalStep('enterDetails');
  };

  const handleAddExercise = async () => {
    if (!dayId || !selectedExerciseFromList?.id) {
      Alert.alert('Hata', 'Lütfen bir egzersiz seçin.');
      return;
    }
    if (savingExercise) return;
    setSavingExercise(true);
    try {
      const currentOrder = exercises.length > 0 ? Math.max(...exercises.map((e) => e.order)) + 1 : 1;
      const exerciseToAdd = {
        day_id: dayId,
        exercise_id: selectedExerciseFromList.id,
        sets: newExerciseSets ? parseInt(newExerciseSets, 10) : null,
        reps: newExerciseReps ? parseInt(newExerciseReps, 10) : null,
        kilo: newExerciseKilo ? parseFloat(newExerciseKilo.replace(',', '.')) : null,
      };

      const { data: newExerciseData, error } = await supabase
        .from('program_exercises')
        .insert(exerciseToAdd)
        .select()
        .single();
      
      if (error) throw error;

      if (newExerciseData) {
        // Supabase'den dönen veriyi direkt kullanmak yerine, tam egzersiz detayını ekleyelim
        const fullExerciseDetails: DetailedProgramExercise = {
          ...(selectedExerciseFromList!),
          ...newExerciseData,
          id: newExerciseData.id, // Supabase'den gelen yeni ID'yi kullan
          day_id: dayId,
          order: newExerciseData.order,
          kilo: newExerciseData.kilo,
        };

        setExercises((prev) => [...prev, fullExerciseDetails].sort((a,b) => a.order - b.order));
        closeAddExerciseModal();
        if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e: any) {
      Alert.alert('Hata', `Egzersiz eklenirken bir sorun oluştu: ${e.message}`);
    } finally {
      setSavingExercise(false);
    }
  };

  const openAddExerciseModal = () => {
    if (allExercisesFromDB.length === 0) {
      fetchAllExercisesFromDB();
    }
    setIsAddExerciseModalVisible(true);
  };

  const closeAddExerciseModal = () => {
    setIsAddExerciseModalVisible(false);
    setTimeout(() => {
      setModalStep('selectBodyPart');
      setSelectedBodyPartInModal(null);
      setSelectedExerciseFromList(null);
      setNewExerciseSets('');
      setNewExerciseReps('');
      setNewExerciseKilo('');
      setNewExerciseNotes('');
      setExerciseSearchQuery('');
    }, 300);
    setSavingExercise(false);
  };

  const renderSelectBodyPartStep = () => (
    <View style={styles.modalContent}>
      {loadingAllExercises ? <ActivityIndicator style={{ marginTop: 20 }} color={Colors.primary} /> : (
        <FlatList
          data={availableBodyParts}
          key="body-part-list"
          keyExtractor={(item) => item}
          numColumns={3} // 3x3 Grid
          contentContainerStyle={{ alignItems: 'center', paddingTop: 24 }}
          renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalBodyPartItem} onPress={() => handleSelectBodyPart(item)}>
                <Image source={getIconForBodyPart(item)} style={styles.modalBodyPartIcon} />
                <Text style={styles.modalBodyPartText}>{capitalize(item)}</Text>
              </TouchableOpacity>
            )
          }
        />
      )}
    </View>
  );

  const renderSelectExerciseStep = () => {
    const filteredExercises = exerciseSearchQuery
      ? exercisesForSelectedBodyPart.filter((ex) =>
          ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
        )
      : exercisesForSelectedBodyPart;

    return (
      <View style={[styles.modalContent, { flex: 1 }]}>
            <TouchableOpacity onPress={() => setModalStep('selectBodyPart')} style={styles.modalBackButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.modalBackText}>Geri Dön</Text>
            </TouchableOpacity>
        <Text style={styles.modalTitle}>'{selectedBodyPartInModal}' için Egzersiz Seç</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
            placeholder="Egzersiz ara..."
          value={exerciseSearchQuery}
          onChangeText={setExerciseSearchQuery}
            placeholderTextColor={Colors.textMuted}
        />
        </View>
        <FlatList
          data={filteredExercises}
          key="exercise-list"
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            const bodyPartKey = item.body_part?.toLowerCase() || '';
            const localExData = popularExercises[bodyPartKey]?.find((e: Exercise) => e.name === item.name);
            const gifSource = localExData ? localExData.gif_url : null;
            
            return (
              <Animated.View entering={FadeIn.delay(index * 30)}>
                <TouchableOpacity style={styles.exerciseSelectItem} onPress={() => handleSelectExercise(item)}>
                  <Image source={gifSource || require('../../assets/images/icons/chest.png')} style={styles.exerciseSelectGif} />
                  <Text style={styles.exerciseSelectName}>{item.name}</Text>
                  <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                {exerciseSearchQuery ? 'Aramanızla eşleşen egzersiz bulunamadı.' : 'Bu bölge için egzersiz bulunamadı.'}
              </Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1, paddingTop: 10 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );
  };
  
  const renderEnterDetailsStep = () => {
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.modalContent}>
                <TouchableOpacity onPress={() => setModalStep('selectExercise')} style={styles.modalBackButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.primary} />
                    <Text style={styles.modalBackText}>Egzersiz Listesine Dön</Text>
                </TouchableOpacity>

                <View style={styles.selectedExerciseHeader}>
                <Image source={getIconForBodyPart(selectedExerciseFromList?.body_part)} style={styles.selectedExerciseIcon} />
                <View>
                    <Text style={styles.selectedExerciseName}>{selectedExerciseFromList?.name}</Text>
                    <Text style={styles.selectedExerciseBodyPart}>{selectedExerciseFromList?.body_part}</Text>
                </View>
                </View>
                
                <Text style={styles.modalSectionTitle}>Set, Tekrar & Kilo</Text>
                <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Set"
                    value={newExerciseSets}
                    onChangeText={setNewExerciseSets}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textMuted}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Tekrar"
                    value={newExerciseReps}
                    onChangeText={setNewExerciseReps}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textMuted}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Kilo"
                    value={newExerciseKilo}
                    onChangeText={setNewExerciseKilo}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textMuted}
                />
                </View>

                <Text style={styles.modalSectionTitle}>Popüler Kısayollar</Text>
                <View style={styles.shortcutContainer}>
                    {popularShortcuts.map(sc => (
                        <TouchableOpacity 
                            key={sc.label} 
                            style={[styles.shortcutChip, newExerciseSets === sc.sets && newExerciseReps === sc.reps && styles.shortcutChipSelected]}
                            onPress={() => {
                                setNewExerciseSets(sc.sets);
                                setNewExerciseReps(sc.reps);
                                setSelectedShortcut(sc.label);
                            }}
                        >
                            <Text style={[styles.shortcutText, newExerciseSets === sc.sets && newExerciseReps === sc.reps && styles.shortcutTextSelected]}>{sc.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                

                <TouchableOpacity style={styles.saveButtonWide} onPress={handleAddExercise} disabled={savingExercise}>
                {savingExercise ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.saveButtonText}>Egzersizi Ekle</Text>
                )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    )
  }

  const renderExerciseItem = ({ item, index }: { item: DetailedProgramExercise, index: number }) => {
    const cardColor = ['#E8F5E9', '#F1F8E9', '#E8F5E9'][index % 3];
    return (
        <TouchableOpacity onPress={() => openEditModal(item)} activeOpacity={0.8}>
            <Animated.View style={[styles.exerciseCard, { backgroundColor: cardColor }]}>
                <Image source={getIconForBodyPart(item.body_part)} style={styles.exerciseIcon} />
                <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseBodyPart}>{item.body_part}</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                    <Ionicons name="barbell" size={14} color={Colors.primary} />
                    <Text style={styles.statText}>{item.sets || '-'} set</Text>
                    </View>
                    <View style={styles.statItem}>
                    <Ionicons name="refresh" size={14} color={Colors.primary} />
                    <Text style={styles.statText}>{item.reps || '-'} tekrar</Text>
                    </View>
                    {item.kilo && (
                    <View style={styles.statItem}>
                        <Ionicons name="speedometer-outline" size={14} color={Colors.primary} />
                        <Text style={styles.statText}>{item.kilo} kg</Text>
                    </View>
                    )}
                </View>
                {item.notes && (
                    <Text style={styles.notesText} numberOfLines={2}>Not: {item.notes}</Text>
                )}
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteExercise(item.id, item.name)}>
                    {isDeleting && editingExercise?.id === item.id ? (
                        <ActivityIndicator color={Colors.error} size="small" />
                    ) : (
                        <Ionicons name="trash-outline" size={22} color={Colors.error} />
                    )}
                </TouchableOpacity>
            </Animated.View>
        </TouchableOpacity>
    );
  };

  const confirmDeleteExercise = (id: string, name: string) => {
    Alert.alert(
        `'${name}' Silinecek`,
        "Bu hareketi silmek istediğinizden emin misiniz?",
        [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Evet, Sil",
                style: "destructive",
                onPress: () => handleDeleteExercise(id),
            },
        ]
    );
  };

  const handleDeleteExercise = async (id: string) => {
    setEditingExercise({ id } as DetailedProgramExercise); // Silme animasyonu için
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('program_exercises').delete().eq('id', id);
      if (error) throw error;
      
      setExercises(prev => prev.filter(ex => ex.id !== id));
      if(!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch(e: any) {
       Alert.alert('Hata', 'Egzersiz silinirken bir hata oluştu: ' + e.message);
    } finally {
       setIsDeleting(false);
       setEditingExercise(null);
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;

    setIsSavingEdit(true);
    try {
        const updates = {
            sets: editSets ? parseInt(editSets, 10) : null,
            reps: editReps ? parseInt(editReps, 10) : null,
            kilo: editKilo ? parseFloat(editKilo.replace(',', '.')) : null,
        };

    const { data, error } = await supabase
        .from('program_exercises')
            .update(updates)
        .eq('id', editingExercise.id)
        .select()
        .single();

        if (error) throw error;

        if (data) {
          setExercises(prev => 
            prev.map(ex => ex.id === data.id ? { ...ex, ...data } : ex)
          );
          closeEditModal();
          if(!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    } catch (e: any) {
        Alert.alert('Hata', 'Egzersiz güncellenirken bir hata oluştu.');
    } finally {
        setIsSavingEdit(false);
    }
  };

  const openEditModal = (exercise: DetailedProgramExercise) => {
    setEditingExercise(exercise);
    setEditSets(exercise.sets?.toString() || '');
    setEditReps(exercise.reps?.toString() || '');
    setEditKilo(exercise.kilo?.toString() || '');
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingExercise(null);
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="barbell-outline" size={60} color={Colors.primary} style={{ opacity: 0.8, marginBottom: 20 }} />
      <Text style={styles.emptyTitle}>Henüz Egzersiz Yok</Text>
      <Text style={styles.emptySubtitle}>Aşağıdaki butona basarak bu güne ilk egzersizini ekle.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
        <Stack.Screen
            options={{
                headerTitle: dayName || 'Egzersizler',
                headerBackVisible: true,
                headerStyle: { backgroundColor: Colors.background },
                headerTitleStyle: { color: Colors.text, fontWeight: 'bold' },
                headerTintColor: Colors.primary,
            }}
        />
        
        {loadingExercises ? (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        ) : (
      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContentContainer}
              ListEmptyComponent={renderEmptyState}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
        )}

        <Animated.View style={styles.fabContainer} entering={FadeIn.delay(300)}>
            <TouchableOpacity style={styles.fab} onPress={openAddExerciseModal}>
                <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
        </Animated.View>

        {/* Egzersiz Ekleme Modalı */}
      <Modal
        animationType="none"
        transparent={true}
        visible={isAddExerciseModalVisible}
            onRequestClose={closeAddExerciseModal}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"} 
              style={styles.modalOverlay}
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFill}>
                <TouchableOpacity style={{ flex: 1 }} onPress={closeAddExerciseModal} />
              </BlurView>

              <Animated.View style={[
                  styles.modalContainer, 
                  modalAnimStyle,
                  modalStep === 'selectBodyPart' && styles.bodyPartModalContainer
                ]}>
                {modalStep === 'selectBodyPart' && renderSelectBodyPartStep()}
                {modalStep === 'selectExercise' && renderSelectExerciseStep()}
                {modalStep === 'enterDetails' && renderEnterDetailsStep()}

                <TouchableOpacity style={styles.closeButton} onPress={closeAddExerciseModal}>
                  <Ionicons name="close" size={24} color={Colors.textMuted} />
                </TouchableOpacity>
              </Animated.View>
            </KeyboardAvoidingView>
      </Modal>

        {/* Düzenleme Modalı */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={isEditModalVisible}
            onRequestClose={closeEditModal}>
            <BlurView intensity={20} style={styles.modalOverlay}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <View style={styles.editModalContainer}>
                        <Text style={styles.modalTitle}>Egzersizi Düzenle</Text>
                        
                        <ScrollView>
                            <Text style={styles.modalSectionTitle}>Set, Tekrar & Kilo</Text>
                            <View style={styles.inputRow}>
                                <TextInput style={styles.input} value={editSets} onChangeText={setEditSets} placeholder="Set" keyboardType="number-pad" />
                                <TextInput style={styles.input} value={editReps} onChangeText={setEditReps} placeholder="Tekrar" keyboardType="number-pad" />
                                <TextInput style={styles.input} value={editKilo} onChangeText={setEditKilo} placeholder="Kilo" keyboardType="decimal-pad" />
                            </View>
                            
                            <Text style={styles.modalSectionTitle}>Popüler Kısayollar</Text>
                            <View style={styles.shortcutContainer}>
                                {popularShortcuts.map(sc => (
                                    <TouchableOpacity 
                                        key={sc.label} 
                                        style={[styles.shortcutChip, editSets === sc.sets && editReps === sc.reps && styles.shortcutChipSelected]}
                                        onPress={() => {
                                            setEditSets(sc.sets);
                                            setEditReps(sc.reps);
                                        }}
                                    >
                                        <Text style={[styles.shortcutText, editSets === sc.sets && editReps === sc.reps && styles.shortcutTextSelected]}>{sc.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={closeEditModal}>
                                <Text style={styles.cancelButtonText}>Vazgeç</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateExercise} disabled={isSavingEdit}>
                                {isSavingEdit ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContentContainer: {
    padding: 16,
    paddingBottom: 100, // FAB için boşluk
  },
  // Fab Button
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 8,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  // Exercise Card
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F0F0F0'
  },
  exerciseDetails: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  exerciseBodyPart: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.primary}15`, // primary with opacity
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  notesText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
  },
  editButton: {
    padding: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxWidth: 500,
    height: '80%',
    maxHeight: 700,
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  bodyPartModalContainer: {
    height: 'auto',
    width: 'auto',
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    backgroundColor: `${Colors.textMuted}20`,
    borderRadius: 15,
  },
  modalContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    paddingRight: 30,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  modalBackText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  // Body Part Selection
  modalBodyPartItem: {
    width: 100,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    margin: 8,
    shadowColor: "#999",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  modalBodyPartIcon: {
    width: 50,
    height: 50,
    marginBottom: 12,
  },
  modalBodyPartText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyPartCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch', // Butonların aynı yüksekliğe sahip olmasını sağlar
    marginTop: 24,
    width: '100%',
    gap: 12,
  },
  bodyPartIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
    borderRadius: 8,
  },
  bodyPartName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  // Exercise Selection
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.text,
  },
  exerciseSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseSelectGif: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#EAEAEA',
  },
  exerciseSelectName: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Details Step
  selectedExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedExerciseIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  selectedExerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedExerciseBodyPart: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 12,
  },
  shortcutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  shortcutChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  shortcutChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  shortcutText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  shortcutTextSelected: {
    color: Colors.white,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Edit Modal
  editModalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    gap: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: `${Colors.error}20`,
    borderRadius: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#A9A9A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  saveButtonWide: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 50,
  },
}); 