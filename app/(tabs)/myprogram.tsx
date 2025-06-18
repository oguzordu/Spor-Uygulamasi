import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutProgram } from '@/types/workout'; // WorkoutProgram tipini import ediyoruz

const isWeb = Platform.OS === 'web';

export default function MyProgramScreen() {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const router = useRouter();

  // useFocusEffect, ekran her odaklandığında çalışır.
  // Bu, başka bir sekmeden geri dönüldüğünde verilerin güncel olmasını sağlar.
  useFocusEffect(
    useCallback(() => {
      const checkSessionAndFetch = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const userLoggedIn = !!session;
        setIsUserLoggedIn(userLoggedIn);

        if (userLoggedIn) {
          await fetchPrograms(session.user.id);
        } else {
          setPrograms([]);
        }
        setLoading(false);
      };

      checkSessionAndFetch();

      // Auth state dinleyicisi, kullanıcı giriş/çıkış yaptığında tetiklenir
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        const userLoggedIn = !!session;
        setIsUserLoggedIn(userLoggedIn);
        if (userLoggedIn) {
          fetchPrograms(session.user.id);
        } else {
          setPrograms([]);
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }, [])
  );

  const fetchPrograms = async (userId: string) => {
    try {
      const { data: programsData, error: programsError } = await supabase
        .from('user_programs')
        .select(`
          id,
          name,
          program_days ( id )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;

      if (programsData) {
        const transformedPrograms = programsData.map(p => ({
          ...p,
          days: p.program_days, // Supabase'den gelen program_days'i days'e atıyoruz
        })) as unknown as WorkoutProgram[];
        setPrograms(transformedPrograms);
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error('Programları çekerken hata:', error);
      Alert.alert("Hata", "Programlar yüklenirken bir sorun oluştu.");
    }
  };


  const handleDeleteProgram = async (programId: string, programName: string) => {
    Alert.alert(
      `'${programName}' Silinecek`,
      "Bu programı ve içindeki tüm günleri/hareketleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: async () => {
            setDeletingId(programId);
            try {
              // 1. Programa ait günlerin ID'lerini al
              const { data: days, error: daysError } = await supabase
                .from('program_days')
                .select('id')
                .eq('program_id', programId);

              if (daysError) throw daysError;

              const dayIds = days.map(d => d.id);

              if (dayIds.length > 0) {
                // 2. Bu günlere ait tüm egzersizleri sil
                const { error: exercisesError } = await supabase
                  .from('program_exercises')
                  .delete()
                  .in('day_id', dayIds);

                if (exercisesError) throw exercisesError;
                
                // 3. Egzersizler silindikten sonra günleri sil
                const { error: deleteDaysError } = await supabase
                  .from('program_days')
                  .delete()
                  .in('id', dayIds);
                
                if (deleteDaysError) throw deleteDaysError;
              }

              // 4. Son olarak programın kendisini sil
              const { error: programError } = await supabase
                .from('user_programs')
                .delete()
                .eq('id', programId);

              if (programError) throw programError;
              
              setPrograms(prevPrograms => prevPrograms.filter(p => p.id !== programId));
              if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            } catch (error: any) {
              Alert.alert('Hata', 'Program silinirken bir hata oluştu: ' + error.message);
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const handleCreateProgram = () => {
    router.push('/create-program');
  };

  const renderProgramItem = ({ item, index }: { item: WorkoutProgram, index: number }) => {
    const isDeleting = deletingId === item.id;
    // Alternate card color: even white, odd green
    const cardColor = index % 2 === 0 ? Colors.white : '#E8F5E9';
    return (
      <Animated.View
        layout={Layout.springify()}
        entering={FadeIn.delay(index * 100).duration(400)}
        style={[styles.programCard, { backgroundColor: cardColor, borderColor: Colors.primary, borderWidth: 1, shadowColor: Colors.primary, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6 }]}
      >
        <Link href={{ pathname: "/program-detail/[id]", params: { id: item.id } }} asChild>
          <TouchableOpacity style={styles.cardTouchable} activeOpacity={0.85}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Image source={require('../../assets/images/program_icon.png')} style={styles.programIconImg} />
              </View>
              <Text style={styles.programName}>{item.name}</Text>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.infoChip}>
                <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                <Text style={styles.infoText}>{item.days.length} Günlük Program</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          onPress={() => handleDeleteProgram(item.id, item.name)}
          style={styles.deleteButton}
          disabled={isDeleting}
        >
          {isDeleting
            ? <ActivityIndicator size="small" color={Colors.error} />
            : <Ionicons name="trash-outline" size={20} color={Colors.error} />
          }
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Programlarım</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="reader-outline" size={80} color={Colors.primary} style={{ marginBottom: 20, opacity: 0.8 }} />
      <Text style={styles.emptyText}>Henüz Bir Programın Yok</Text>
      <Text style={styles.emptySubText}>Hemen bir tane oluşturarak hedeflerine bir adım daha yaklaş!</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateProgram} activeOpacity={0.85}>
        <Ionicons name="add" size={20} color={Colors.white} />
        <Text style={styles.createButtonText}>Yeni Program Oluştur</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (loading && programs.length === 0) {
    return (
      <View style={styles.containerLoading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (!isUserLoggedIn && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loggedOutContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={Colors.secondary} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Programlarını görmek için giriş yapmalısın.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.85}>
            <Text style={styles.loginButtonText}>Giriş Yap / Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id}
        renderItem={renderProgramItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContentContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
      {programs.length > 0 && !isWeb && (
         <Animated.View entering={FadeIn.delay(200)} style={styles.fabWrapper}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleCreateProgram}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={28} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  containerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  programCard: {
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  cardTouchable: {
    padding: 22,
    borderRadius: 20,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  programIconImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  programName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0F2F1',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  deleteButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 32,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOpacity: 0.13,
    shadowRadius: 8,
    marginTop: 8,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  loggedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 32,
    marginTop: 18,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    shadowColor: Colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },
  fab: {
    backgroundColor: Colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
}); 