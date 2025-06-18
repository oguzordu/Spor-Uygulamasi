import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../utils/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { WorkoutProgram } from '../../types/workout';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Turkish locale configuration
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: "Bugün"
};
LocaleConfig.defaultLocale = 'tr';

interface WorkoutLog {
  id?: string;
  user_id: string;
  program_exercise_id: string;
  date: string;
  sets?: number;
  reps?: number;
  kilo?: number;
  notes?: string;
}

interface DailyExercise {
  // From program_exercises table (the plan)
  id: string; // This is program_exercises.id
  day_id: string;
  name: string;
  body_part?: string;
  planned_sets?: number | null;
  planned_reps?: number | null;
  planned_kilo?: string;
  notes?: string;
  order: number;
  
  // From workout_logs table (the actual performance)
  log: WorkoutLog | null;
}

interface CalendarSchedule {
  id: string;
  user_id: string;
  program_id: string;
  start_date: string;
  duration: number;
  duration_type: 'weeks' | 'months';
  rest_days: number;
}

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    text?: string;
    selected?: boolean;
    selectedColor?: string;
    customStyles?: {
      container: {
        backgroundColor: string;
        borderRadius: number;
        padding: number;
        marginTop: number;
      };
      text: {
        color: string;
        fontSize: number;
        fontWeight: string;
      };
    };
  };
}

interface DayComponentProps {
  date: DateData;
  state: 'selected' | 'disabled' | 'today' | '';
  marking?: {
    marked?: boolean;
    dotColor?: string;
    text?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const isWeb = Platform.OS === 'web';

export default function TabOneScreen() {
  const router = useRouter();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Kullanıcı');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [restDays, setRestDays] = useState(1);
  const [durationType, setDurationType] = useState<'weeks' | 'months'>('weeks');
  const [duration, setDuration] = useState(4);
  const [showDayModal, setShowDayModal] = useState(false);
  const [calendarSchedule, setCalendarSchedule] = useState<CalendarSchedule | null>(null);
  const [dailyWorkout, setDailyWorkout] = useState<DailyExercise[]>([]);
  const [isDayDetailLoading, setIsDayDetailLoading] = useState(false);

  // Set up auth listener once
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const userLoggedIn = !!session;
      setIsUserLoggedIn(userLoggedIn);

      if (userLoggedIn) {
        if (session?.user?.email) {
            const emailParts = session.user.email.split('@')[0];
            setUserName(emailParts.charAt(0).toUpperCase() + emailParts.slice(1));
        }
        // Data will be fetched by useFocusEffect, no need to call here
      } else {
        // Clear all user-specific data on logout
        setUserName('Kullanıcı');
        setPrograms([]);
        setCalendarSchedule(null);
        setMarkedDates({});
      }
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  // useFocusEffect runs when the screen comes into focus.
  // This ensures data is fresh when returning from another tab or after login.
  useFocusEffect(
    useCallback(() => {
      const checkSessionAndFetch = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsUserLoggedIn(true);
          await loadPrograms();
          await loadCalendarSchedule();
        } else {
          setIsUserLoggedIn(false);
          setPrograms([]);
          setCalendarSchedule(null);
          setMarkedDates({});
        }
        setLoading(false); // Stop loading indicator in all cases
      };

      checkSessionAndFetch();
    }, [])
  );

  const loadCalendarSchedule = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_calendar_schedule')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Takvim programı yüklenirken hata:', error);
      Alert.alert('Hata', 'Takvim programı yüklenemedi.');
    } else if (data) {
      setCalendarSchedule(data);
    }
  };

  useEffect(() => {
    if (calendarSchedule && programs.length > 0) {
      const scheduledProgram = programs.find(p => p.id === calendarSchedule.program_id);
      if (scheduledProgram) {
        generateMarkedDates(
          scheduledProgram, 
          new Date(calendarSchedule.start_date), 
          calendarSchedule.duration,
          calendarSchedule.duration_type,
          calendarSchedule.rest_days
        );
      }
    } else {
        setMarkedDates({}); // Program veya takvim yoksa işaretleri temizle
    }
  }, [calendarSchedule, programs]);

  // Load programs from database
  const loadPrograms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPrograms([]); // Clear programs if no user
        return;
      }

      const { data: programsData, error: programsError } = await supabase
        .from('user_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;
      if (!programsData) {
        setPrograms([]);
        return;
      }

      const programsWithDays = await Promise.all(
        programsData.map(async (program) => {
          const { data: daysData, error: daysError } = await supabase
            .from('program_days')
            .select('*')
            .eq('program_id', program.id)
            .order('order', { ascending: true });

          if (daysError) return { ...program, days: [] };

          const daysWithExercises = await Promise.all(
            (daysData || []).map(async (day) => {
              const { data: exercisesData, error: exercisesError } = await supabase
                .from('program_exercises')
                .select('*, exercises_list(name, body_part, gif_url)')
                .eq('day_id', day.id)
                .order('order', { ascending: true });

              if (exercisesError) {
                console.error('Egzersiz verileri çekilirken hata:', exercisesError);
                return { ...day, exercises: [] };
              };

              return {
                id: day.id,
                name: day.day_name,
                exercises: (exercisesData || []).map(exercise => {
                  const exerciseDetails = exercise.exercises_list;
                  return {
                    id: exercise.id, 
                    exercise_id: exercise.exercise_id, 
                    name: exerciseDetails?.name || 'Bilinmeyen Egzersiz',
                    body_part: exerciseDetails?.body_part,
                    gif_url: exerciseDetails?.gif_url,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.kilo,
                    notes: exercise.notes
                  }
                })
              };
            })
          );

          return {
            id: program.id,
            name: program.name,
            description: program.description || '',
            days: daysWithExercises,
            createdAt: (program.created_at as any)?.toString() || new Date().toISOString(),
            updatedAt: (program.updated_at as any)?.toString() || new Date().toISOString(),
          };
        })
      );

      setPrograms(programsWithDays);
    } catch (error) {
      console.error('Error in loadPrograms:', error);
      Alert.alert('Hata', 'Programlar yüklenirken bir hata oluştu.');
    }
  };

  const generateMarkedDates = (
    program: WorkoutProgram,
    sDate: Date,
    dur: number,
    durType: 'weeks' | 'months',
    rDays: number
  ) => {
      const newMarkedDates: MarkedDates = {};
      const totalDays = durType === 'weeks' ? dur * 7 : dur * 30;
      let currentDate = new Date(sDate);
    let dayIndex = 0;
      let cycleDayIndex = 0;

      if (!program.days || program.days.length === 0) {
        setMarkedDates({});
        return;
      }

    for (let i = 0; i < totalDays; i++) {
        const isRestDay = cycleDayIndex >= program.days.length;

        if (isRestDay) {
          const restDateStr = currentDate.toISOString().split('T')[0];
          newMarkedDates[restDateStr] = {
        marked: true,
              dotColor: Colors.error,
        customStyles: {
          container: {
                      backgroundColor: Colors.error + '20',
            borderRadius: 8,
                      padding: 2,
                      marginTop: 2,
          },
          text: {
                      color: Colors.error,
                      fontSize: 10,
                      fontWeight: 'bold',
                  },
              },
          };
          (newMarkedDates[restDateStr] as any).text = 'Dinlenme';

        } else {
          const day = program.days[dayIndex % program.days.length];
          const dateStr = currentDate.toISOString().split('T')[0];
          newMarkedDates[dateStr] = {
            marked: true,
            dotColor: Colors.primary,
            customStyles: {
              container: {
                backgroundColor: Colors.primary + '20',
                borderRadius: 8,
                padding: 2,
                marginTop: 2,
              },
              text: {
                color: Colors.primary,
                fontSize: 10,
                fontWeight: 'bold',
              }
            }
          };
          (newMarkedDates[dateStr] as any).text = day.name;
          dayIndex++;
        }
        
        cycleDayIndex++;
        if(cycleDayIndex >= program.days.length + rDays) {
            cycleDayIndex = 0;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setMarkedDates(newMarkedDates);
  };

  const handleAddToCalendar = async () => {
    if (!selectedProgram) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Hata', 'Takvime eklemek için giriş yapmalısınız.');
      return;
    }
    
    const scheduleData = {
      user_id: user.id,
      program_id: selectedProgram.id,
      start_date: startDate.toISOString().split('T')[0],
      duration: duration,
      duration_type: durationType,
      rest_days: restDays,
    };

    const { data, error } = await supabase
      .from('user_calendar_schedule')
      .upsert({ ...scheduleData, user_id: user.id }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Takvim kaydedilirken hata:', error);
      Alert.alert('Hata', 'Takvim programı kaydedilemedi.');
    } else if (data) {
      Alert.alert('Başarılı', 'Programınız takvime eklendi.');
      setCalendarSchedule(data as CalendarSchedule);
    setShowAddModal(false);
    }
  };

  const loadDailyWorkout = useCallback(async (date: string) => {
    if (!calendarSchedule || !programs.length) return;
    setIsDayDetailLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const dayInfo = markedDates[date];
      if (!dayInfo || !(dayInfo as any).text || (dayInfo as any).text === 'Dinlenme') {
        setDailyWorkout([]);
        return;
      }
      
      const program = programs.find(p => p.id === calendarSchedule.program_id);
      if (!program) throw new Error("Program bulunamadı.");
      
      const dayName = (dayInfo as any).text;
      const workoutDay = program.days.find(d => d.name === dayName);
      if (!workoutDay || !workoutDay.exercises) throw new Error("Antrenman günü veya hareketler bulunamadı.");
      
      const { data: logs, error: logsError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date);
      
      if (logsError) throw logsError;

      const exercisesWithLogs: DailyExercise[] = workoutDay.exercises.map(exercise => {
        const existingLog = logs.find(l => l.program_exercise_id === exercise.id) || null;

        const logForDisplay: WorkoutLog = {
          id: existingLog?.id,
          user_id: user.id,
          program_exercise_id: exercise.id,
          date: date,
          sets: existingLog?.sets ?? exercise.sets ?? undefined,
          reps: existingLog?.reps ?? exercise.reps ?? undefined,
          kilo: existingLog?.kilo ?? exercise.weight ?? undefined,
          notes: existingLog?.notes ?? exercise.notes ?? undefined,
        };

        return {
          id: exercise.id,
          day_id: workoutDay.id,
          name: exercise.name,
          body_part: exercise.body_part,
          planned_sets: exercise.sets,
          planned_reps: exercise.reps,
          planned_kilo: exercise.weight?.toString(),
          order: 0,
          log: logForDisplay,
        };
      });

      setDailyWorkout(exercisesWithLogs);

    } catch (error: any) {
      console.error("Günlük antrenman yüklenirken hata:", error);
      Alert.alert("Hata", error.message || "Günlük antrenman yüklenemedi.");
    } finally {
      setIsDayDetailLoading(false);
    }
  }, [calendarSchedule, programs, markedDates]);

  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    const dayInfo = markedDates[day.dateString];
    if (dayInfo && (dayInfo as any).text) {
      setShowDayModal(true);
      loadDailyWorkout(day.dateString);
    }
  }, [markedDates, loadDailyWorkout]);

  const handleExerciseLogUpdate = useCallback(async (exerciseId: string, field: 'sets' | 'reps' | 'kilo', value: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id || '';

    setDailyWorkout(currentWorkout =>
      currentWorkout.map(exercise => {
        if (exercise.id === exerciseId) {
          const newLog = { ...exercise.log };

          if (!newLog.user_id) {
            newLog.user_id = userId;
            newLog.program_exercise_id = exercise.id;
            newLog.date = selectedDate || '';
          }

          const numericValue = value.replace(/[^0-9.]/g, '');
          if (field === 'kilo') {
            newLog[field] = numericValue ? parseFloat(numericValue) : undefined;
          } else {
            newLog[field] = numericValue ? parseInt(numericValue, 10) : undefined;
          }

          return { ...exercise, log: newLog as WorkoutLog };
        }
        return exercise;
      })
    );
  }, [selectedDate]);

  const handleSaveWorkoutLog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Hata', 'Değişiklikleri kaydetmek için giriş yapmalısınız.');
      return;
    }

    const logsToUpsert = dailyWorkout
      .filter(exercise => exercise.log && (exercise.log.sets !== undefined || exercise.log.reps !== undefined || exercise.log.kilo !== undefined))
      .map(exercise => {
        const logData: any = {
          user_id: user.id,
          program_exercise_id: exercise.id,
          date: selectedDate!,
          sets: exercise.log!.sets,
          reps: exercise.log!.reps,
          kilo: exercise.log!.kilo,
          notes: exercise.log!.notes
        };
        if (exercise.log!.id) {
          logData.id = exercise.log!.id;
        }
        return logData;
      });
    
    if (logsToUpsert.length === 0) {
      Alert.alert("Bilgi", "Kaydedilecek bir değişiklik yok.");
      return;
    }

    try {
      const { error } = await supabase.from('workout_logs').upsert(logsToUpsert, {
        onConflict: 'user_id,program_exercise_id,date',
      });
      if (error) throw error;

      Alert.alert("Başarılı", "Antrenmanınız kaydedildi!");
      setShowDayModal(false);
    } catch (error: any) {
      console.error("Antrenman logu kaydedilemedi:", error);
      Alert.alert("Hata", "Antrenman logu kaydedilemedi: " + error.message);
    }
  };

  const handleMissedDay = async () => {
    if (!selectedDate || !calendarSchedule) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate + 'T00:00:00');

    if (selected > today) {
        Alert.alert("Hata", "Gelecekteki bir antrenman gününü atlayamazsınız.");
        return;
    }

    Alert.alert(
        "Antrenmanı Atla",
        "Bu antrenmanı atlamak istediğinizden emin misiniz? Tüm gelecekteki antrenmanlarınız bir gün ertelenecektir.",
        [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Evet, Atla",
                style: "destructive",
                onPress: async () => {
                    try {
                        const oldStartDate = new Date(calendarSchedule.start_date + 'T00:00:00');
                        const newStartDate = new Date(oldStartDate);
                        newStartDate.setDate(oldStartDate.getDate() + 1);

                        const newStartDateString = newStartDate.toISOString().split('T')[0];

                        const { error } = await supabase
                            .from('user_calendar_schedule')
                            .update({ start_date: newStartDateString })
                            .eq('id', calendarSchedule.id);

                        if (error) throw error;

                        Alert.alert("Başarılı", "Antrenman atlandı ve programınız bir gün ertelendi.");
                        setShowDayModal(false);
                        await loadCalendarSchedule();
                    } catch (error: any) {
                        console.error("Antrenman atlanırken hata:", error);
                        Alert.alert("Hata", "Program ertelenirken bir hata oluştu: " + error.message);
                    }
                }
            }
        ]
    );
  };

  const handleClearCalendar = async () => {
    if (!calendarSchedule) return;

    Alert.alert(
      "Takvimi Temizle",
      "Mevcut antrenman takvimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Evet, Sil", 
          style: "destructive", 
          onPress: async () => {
            try {
              if (!calendarSchedule?.id) {
                  Alert.alert("Hata", "Takvim bilgisi bulunamadı.");
                  return;
              }
              const { error } = await supabase
                .from('user_calendar_schedule')
                .delete()
                .eq('id', calendarSchedule.id);

              if (error) throw error;
              
              setCalendarSchedule(null);
              setMarkedDates({});
              if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Başarılı", "Antrenman takviminiz temizlendi.");

            } catch (error: any) {
              Alert.alert("Hata", "Takvim temizlenirken bir sorun oluştu: " + error.message);
            }
          } 
        },
      ]
    );
  };

  const dayRenderer = ({ date, state, marking }: DayComponentProps) => {
    const localMarking = marking as any;
    const isToday = state === 'today';
    const isSelected = selectedDate === date.dateString;

    return (
        <TouchableOpacity 
            onPress={() => onDayPress(date)}
            style={[
                styles.dayContainer, 
                isSelected && styles.daySelected,
                isToday && !isSelected && styles.dayToday
            ]}
        >
            <Text style={[
                styles.dayText, 
                state === 'disabled' && styles.dayDisabled,
                isSelected && styles.daySelectedText,
                isToday && !isSelected && styles.dayTodayText,
            ]}>
                {date.day}
            </Text>
            {localMarking?.text && (
                <View style={localMarking.customStyles?.container}>
                    <Text style={localMarking.customStyles?.text}>
                        {markedDates[date.dateString]?.text}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Antrenman Takvimi</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Programlar yükleniyor...</Text>
          </View>
        ) : !isUserLoggedIn ? (
            <View style={styles.emptyProgramListContainer}>
                <Ionicons name="log-in-outline" size={60} color={Colors.primary} />
                <Text style={styles.emptyProgramListText}>
                  Takviminizi görmek için lütfen giriş yapın.
                </Text>
                <TouchableOpacity
                  style={styles.createProgramButton}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Text style={styles.createProgramButtonText}>Giriş Yap / Kayıt Ol</Text>
                </TouchableOpacity>
            </View>
        ) : (
          <>
        <Calendar
              firstDay={1}
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType="custom"
              renderArrow={(direction: 'left' | 'right') => <Ionicons name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} size={24} color={Colors.primary} />}
              onMonthChange={(month: DateData) => { console.log('month changed', month); }}
          theme={{
                calendarBackground: Colors.card,
                textSectionTitleColor: Colors.text,
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: Colors.white,
            todayTextColor: Colors.primary,
            dayTextColor: Colors.text,
                textDisabledColor: Colors.text + '50',
            arrowColor: Colors.primary,
                monthTextColor: Colors.text,
            indicatorColor: Colors.primary,
                'stylesheet.calendar.header': {
                  dayTextAtIndex0: {
                    color: Colors.text
                  },
                  dayTextAtIndex5: {
                    color: Colors.error
                  },
                  dayTextAtIndex6: {
                    color: Colors.error
                  }
                },
                'stylesheet.day.basic': {
                  base: {
                    width: 32,
                    height: 32,
                    alignItems: 'center'
                  }
                },
                'stylesheet.day.period': {
                  base: {
                    overflow: 'hidden',
                    height: 34
                  }
                },
                'stylesheet.calendar.main': {
                  dayContainer: {
                    flex: 1,
                    alignItems: 'center',
                    padding: 4
              }
            }
          }}
              dayComponent={dayRenderer}
            />
            
            {calendarSchedule && (
              <View style={styles.activeScheduleContainer}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                <Text style={styles.activeScheduleText}>
                  Aktif program takvime eklendi.
                </Text>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearCalendar}>
                  <Ionicons name="trash-outline" size={18} color={Colors.white} />
                  <Text style={styles.clearButtonText}>Kaldır</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.addToCalendarButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.white} style={styles.buttonIcon} />
              <Text style={styles.addToCalendarText}>Takvime Program Ekle</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
        onShow={() => {
          if (programs.length > 0 && !selectedProgram) {
            setSelectedProgram(programs[0]);
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Program Ekle</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
      </View>

            {programs.length > 0 ? (
            <ScrollView style={styles.programList}>
              {programs.map(program => (
                <TouchableOpacity
                  key={program.id}
                  style={[
                    styles.programItem,
                    selectedProgram?.id === program.id && styles.selectedProgram
                  ]}
                  onPress={() => setSelectedProgram(program)}
                >
                  <View style={styles.programInfo}>
                    <Text style={styles.programName}>{program.name}</Text>
                    <Text style={styles.programDescription} numberOfLines={2}>
                      {program.description}
                    </Text>
                  </View>
                  {selectedProgram?.id === program.id && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
          </TouchableOpacity>
              ))}
            </ScrollView>
            ) : (
              <View style={styles.emptyProgramListContainer}>
                <Text style={styles.emptyProgramListText}>
                  Takvime eklemek için önce bir program oluşturmalısınız.
                </Text>
                <TouchableOpacity
                  style={styles.createProgramButton}
                  onPress={() => {
                    setShowAddModal(false);
                    router.push('/(tabs)/myprogram');
                  }}
                >
                  <Text style={styles.createProgramButtonText}>Program Oluştur</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={Colors.primary} style={styles.dateIcon} />
                <Text style={styles.dateButtonText}>
                  Başlangıç: {startDate.toLocaleDateString('tr-TR')}
                </Text>
          </TouchableOpacity>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Dinlenme Günleri:</Text>
                <View style={styles.restDaysContainer}>
                  <TouchableOpacity
                    style={styles.restDayButton}
                    onPress={() => setRestDays(Math.max(0, restDays - 1))}
                  >
                    <Ionicons name="remove" size={20} color={Colors.primary} />
          </TouchableOpacity>
                  <Text style={styles.restDayText}>{restDays}</Text>
                  <TouchableOpacity
                    style={styles.restDayButton}
                    onPress={() => setRestDays(restDays + 1)}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Süre:</Text>
                <View style={styles.durationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.durationTypeButton,
                      durationType === 'weeks' && styles.selectedDurationType
                    ]}
                    onPress={() => setDurationType('weeks')}
                  >
                    <Text style={[
                      styles.durationTypeText,
                      durationType === 'weeks' && styles.selectedDurationTypeText
                    ]}>Hafta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.durationTypeButton,
                      durationType === 'months' && styles.selectedDurationType
                    ]}
                    onPress={() => setDurationType('months')}
                  >
                    <Text style={[
                      styles.durationTypeText,
                      durationType === 'months' && styles.selectedDurationTypeText
                    ]}>Ay</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.durationInputContainer}>
                  <TouchableOpacity
                    style={styles.durationButton}
                    onPress={() => setDuration(Math.max(1, duration - 1))}
                  >
                    <Ionicons name="remove" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.durationText}>{duration}</Text>
                  <TouchableOpacity
                    style={styles.durationButton}
                    onPress={() => setDuration(duration + 1)}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) {
                    setStartDate(date);
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.addButton,
                  !selectedProgram && styles.disabledButton
                ]}
                onPress={handleAddToCalendar}
                disabled={!selectedProgram}
              >
                <Text style={styles.buttonText}>Takvime Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Günlük Program Modalı */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDayModal(false)}
      >
        <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPressOut={() => setShowDayModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDayModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {isDayDetailLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{marginVertical: 40}}/>
            ) : dailyWorkout.length > 0 ? (
              <>
                <FlatList
                  data={dailyWorkout}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 120 }} // Butonlar için boşluk
                  renderItem={({ item }) => {
                    const isFutureDate = selectedDate ? new Date(selectedDate + 'T00:00:00') > new Date() : false;
                    return (
                      <View style={styles.dailyExerciseItem}>
                        <Text style={styles.dailyExerciseName}>{item.name}</Text>
                        
                        <View style={styles.planContainer}>
                          <Text style={styles.planTitle}>Planlanan</Text>
                          <View style={styles.planDetails}>
                            <Text style={styles.planText}>{item.planned_sets ?? '...'} Set</Text>
                            <Text style={styles.planText}>{item.planned_reps ?? '...'} Tekrar</Text>
                            <Text style={styles.planText}>{item.planned_kilo ?? '...'} kg</Text>
                          </View>
                        </View>

                        <Text style={styles.logTitle}>Bugünkü Performans</Text>
                        <View style={styles.dailyInputsContainer}>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Set</Text>
                            <TextInput
                              style={[styles.input, isFutureDate && styles.disabledInput]}
                              keyboardType="number-pad"
                              onChangeText={text => handleExerciseLogUpdate(item.id, 'sets', text)}
                              value={item.log?.sets?.toString() || ''}
                              editable={!isFutureDate}
                            />
                          </View>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tekrar</Text>
                            <TextInput
                              style={[styles.input, isFutureDate && styles.disabledInput]}
                              keyboardType="number-pad"
                              onChangeText={text => handleExerciseLogUpdate(item.id, 'reps', text)}
                              value={item.log?.reps?.toString() || ''}
                              editable={!isFutureDate}
                            />
                          </View>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Kilo</Text>
                            <TextInput
                              style={[styles.input, isFutureDate && styles.disabledInput]}
                              keyboardType="decimal-pad"
                              onChangeText={text => handleExerciseLogUpdate(item.id, 'kilo', text)}
                              value={item.log?.kilo?.toString() || ''}
                              editable={!isFutureDate}
                            />
                          </View>
                        </View>
                      </View>
                    )
                  }}
                />
                <View style={styles.dayModalFooter}>
                    <TouchableOpacity style={styles.missedDayButton} onPress={handleMissedDay}>
                        <Ionicons name="play-skip-forward-outline" size={20} color={Colors.error} />
                        <Text style={styles.missedDayButtonText}>Antrenmanı Atla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveLogButton} onPress={handleSaveWorkoutLog}>
                        <Ionicons name="checkmark-done-outline" size={20} color={Colors.white} />
                        <Text style={styles.saveLogButtonText}>Değişiklikleri Kaydet</Text>
                    </TouchableOpacity>
                </View>
              </>
            ) : (
                  <View style={styles.restDayContainer}>
                 <Ionicons name="fitness-outline" size={48} color={Colors.secondary} />
                    <Text style={styles.restDayTitle}>Dinlenme Günü</Text>
                 <Text style={styles.restDaySubText}>Bugün dinlenme zamanı. Enerjini yarınki antrenman için topla!</Text>
                  </View>
      )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
  },
  scrollView: {
    flex: 1,
  },
  addToCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToCalendarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  programList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedProgram: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  programInfo: {
    flex: 1,
    marginRight: 12,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    color: Colors.text + '99',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    marginBottom: 20,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  addButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.primary + '80',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text,
  },
  dayContainer: {
    width: 42,
    height: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  daySelected: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  daySelectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dayToday: {
    // Today's special style can be subtle
  },
  dayTodayText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  dayDisabled: {
    color: Colors.tabIconDefault,
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  restDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
  },
  restDayButton: {
    padding: 8,
  },
  restDayText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
    marginRight: 12,
  },
  durationTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectedDurationType: {
    backgroundColor: Colors.primary,
  },
  durationTypeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  selectedDurationTypeText: {
    color: Colors.white,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
  },
  durationButton: {
    padding: 8,
  },
  durationText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  exerciseList: {
    flex: 1,
    width: '100%',
  },
  exerciseItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseDetail: {
    fontSize: 14,
    color: Colors.text + '80',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exerciseNotes: {
    fontSize: 14,
    color: Colors.text + '80',
    fontStyle: 'italic',
    marginTop: 8,
  },
  restDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    marginVertical: 16,
  },
  restDayTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  restDaySubText: {
    fontSize: 16,
    color: Colors.text + '80',
    textAlign: 'center',
  },
  emptyProgramListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginVertical: 20,
  },
  emptyProgramListText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  createProgramButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createProgramButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dailyExerciseItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dailyExerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  planContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  planText: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 8,
    marginTop: 4,
  },
  dailyInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.white,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#212529',
  },
  dayModalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 12,
  },
  saveLogButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveLogButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  missedDayButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  missedDayButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledInput: {
    backgroundColor: '#F1F3F5',
    color: '#ADB5BD',
    borderColor: '#DEE2E6',
  },
  activeScheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 16,
    gap: 10,
  },
  activeScheduleText: {
    flex: 1,
    color: Colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    gap: 6,
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
