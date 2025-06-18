import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors'; // Path alias kullanıldı
import { supabase } from '@/utils/supabase'; // Path alias kullanıldı
import Animated, { FadeIn, FadeOut, withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const isWeb = Platform.OS === 'web';

export default function CreateProgramScreen() {
  const [programName, setProgramName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [inputError, setInputError] = useState(false);
  const shake = useSharedValue(0);
  const inputAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const handleSaveProgram = async () => {
    console.log("handleSaveProgram çağrıldı. Program adı:", programName);

    if (!programName.trim()) {
      setInputError(true);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Shake animasyonu
      shake.value = withSpring(-10, { damping: 2 }, () => {
        shake.value = withSpring(10, { damping: 2 }, () => {
          shake.value = withSpring(0);
        });
      });
      Alert.alert('Hata', 'Lütfen program için bir isim girin.');
      return;
    }
    setInputError(false);
    setLoading(true);
    try {
      console.log("Kullanıcı bilgisi çekiliyor...");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Kullanıcı bilgisi:", user);

      if (!user) {
        console.log("Kullanıcı bulunamadı, giriş uyarısı gösterilecek.");
        Alert.alert('Hata', 'Program kaydetmek için giriş yapmalısınız.');
        router.replace('/profile'); // Veya (tabs)/profile
        setLoading(false);
        return;
      }
      
      console.log("Supabase insert işlemi deneniyor. user_id:", user.id, "programName:", programName);
      const { data: newProgram, error } = await supabase
        .from('user_programs') // Supabase tablo adınız
        .insert([{ name: programName, user_id: user.id }]) // user_id GERİ ALINDI
        .select('id') 
        .single(); 

      console.log("Supabase insert sonucu - Hata:", error);
      console.log("Supabase insert sonucu - Yeni Program:", newProgram);

      if (error) {
        console.error('Program kaydederken hata:', error);
        Alert.alert('Hata', 'Program kaydedilirken bir sorun oluştu: ' + error.message);
      } else if (newProgram && newProgram.id) {
        if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setProgramName('');
        // Onay animasyonu
        Alert.alert('Başarılı', 'Program başarıyla kaydedildi!');
        router.replace({ pathname: "/program-detail/[id]", params: { id: newProgram.id } });
      } else {
        console.error('Program kaydedildi ama ID alınamadı.', newProgram);
        Alert.alert('Hata', 'Program kaydedildi ancak ID alınamadı. Lütfen Programlarım listesinden kontrol edin.');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/myprogram');
        }
      }
    } catch (e: any) {
      console.error('handleSaveProgram içinde genel hata:', e);
      Alert.alert('Hata', 'Beklenmedik bir sorun oluştu: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Yeni Program Oluştur' }} />
      <Text style={styles.label}>Program Adı:</Text>
      <Animated.View style={inputAnimStyle}>
        <TextInput
          style={[styles.input, inputError && { borderColor: Colors.error, backgroundColor: '#ffeaea' }]}
          placeholder="Örn: Haftalık Antrenman Programım"
          value={programName}
          onChangeText={text => { setProgramName(text); setInputError(false); }}
          placeholderTextColor={Colors.tabIconDefault}
        />
      </Animated.View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProgram} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={22} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Programı Kaydet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background, 
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text, 
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 25,
    color: Colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
}); 