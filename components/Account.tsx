import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Button, Input, Card } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'

// Yeşil tema renkleri (Auth.tsx ile aynı)
const Colors = {
  primary: '#2E7D32', // Yeşil tonu
  lightGreen: '#C8E6C9',
  error: '#D32F2F', // Kırmızı tonu
  white: '#FFFFFF',
  grey: '#888',
  black: '#000000',
  lightGrey: '#f0f0f0',
}

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false) // Güncelleme için ayrı loading state
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null) // Geri bildirim mesajı state'i

  // Mesajı temizleme fonksiyonu
  const clearMessage = () => setMessage(null)

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      clearMessage()
      if (!session?.user) throw new Error('Oturumda kullanıcı bulunamadı!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.error('Get profile error:', error)
      if (error instanceof Error) {
        setMessage({ text: `Profil alınamadı: ${error.message}`, isError: true })
      } else {
        setMessage({ text: 'Profil alınırken bilinmeyen bir hata oluştu.', isError: true })
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    avatar_url,
  }: {
    username: string
    avatar_url: string
  }) {
    try {
      setUpdating(true) // Güncelleme state'ini kullan
      clearMessage()
      if (!session?.user) throw new Error('Oturumda kullanıcı bulunamadı!')

      const updates = {
        id: session?.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
      setMessage({ text: 'Profil başarıyla güncellendi.', isError: false })
    } catch (error) {
      console.error('Update profile error:', error)
      if (error instanceof Error) {
        setMessage({ text: `Profil güncellenemedi: ${error.message}`, isError: true })
      } else {
        setMessage({ text: 'Profil güncellenirken bilinmeyen bir hata oluştu.', isError: true })
      }
    } finally {
      setUpdating(false) // Güncelleme state'ini kullan
    }
  }

  async function handleSignOut() {
    setLoading(true)
    clearMessage()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      setMessage({ text: `Çıkış yapılamadı: ${error.message}`, isError: true })
      setLoading(false)
    } else {
      // Oturum zaten değişecek, loading state'i sıfırlamaya gerek yok
    }
  }

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* İlk yükleme için spinner (tüm ekranı kaplar) */}
        {loading && !updating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.innerContainer}>
            <Card containerStyle={styles.card}>
              {/* Geri Bildirim Mesajı Alanı */}
              {message && (
                <Text style={[styles.message, message.isError ? styles.errorMessage : styles.successMessage]}>
                  {message.text}
                </Text>
              )}

              <Input
                label="E-posta"
                labelStyle={styles.label}
                value={session?.user?.email}
                disabled
                inputContainerStyle={styles.inputContainerDisabled}
                inputStyle={styles.inputText}
                disabledInputStyle={styles.inputTextDisabled}
              />

              <Input
                label="Kullanıcı Adı"
                labelStyle={styles.label}
                value={username || ''}
                onChangeText={(text: string) => {
                  setUsername(text)
                  clearMessage()
                }}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
              />

              <Button
                title={updating ? 'Güncelleniyor...' : 'Profili Güncelle'}
                onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
                disabled={updating}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                loading={updating}
                containerStyle={styles.buttonContainer}
              />
            </Card>

            <Button
              title="Çıkış Yap"
              onPress={handleSignOut}
              disabled={loading || updating}
              buttonStyle={[styles.signOutButton, styles.buttonOutline]}
              titleStyle={[styles.buttonTitle, styles.buttonOutlineTitle]}
              containerStyle={styles.signOutButtonContainer}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGrey,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    borderWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  message: {
    textAlign: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    fontSize: 14,
  },
  successMessage: {
    color: Colors.primary,
    backgroundColor: Colors.lightGreen,
  },
  errorMessage: {
    color: Colors.white,
    backgroundColor: Colors.error,
  },
  label: {
    color: Colors.grey,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.lightGreen,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.white,
    height: 50,
    marginBottom: 15,
  },
  inputContainerDisabled: {
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.lightGrey,
    height: 50,
    marginBottom: 15,
  },
  inputText: {
    color: Colors.black,
    fontSize: 16,
  },
  inputTextDisabled: {
    color: Colors.grey,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonTitle: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButtonContainer: {
    width: '100%',
  },
  signOutButton: {
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  buttonOutlineTitle: {
    color: Colors.primary,
  },
})