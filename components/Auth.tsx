import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { supabase } from '../utils/supabase'
import { Button, Input, Card } from '@rneui/themed'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

// Yeşil tema renkleri (constants/Colors.ts dosyanız varsa oradan almak daha iyi olur)
const Colors = {
  primary: '#2E7D32', // Yeşil tonu
  lightGreen: '#C8E6C9',
  error: '#D32F2F', // Kırmızı tonu
  white: '#FFFFFF',
  grey: '#888',
  black: '#000000',
  lightGrey: '#f0f0f0',
}

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  // Mesajı temizleme fonksiyonu
  const clearMessage = () => setMessage(null)

  async function signInWithEmail() {
    setLoading(true)
    clearMessage() // Önceki mesajı temizle
    console.log('Attempting sign in with:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      console.error('Sign in error:', error)
      setMessage({ text: error.message || 'Giriş başarısız.', isError: true })
    } else {
      console.log('Sign in successful')
      setMessage({ text: 'Giriş başarılı! Yönlendiriliyorsunuz...', isError: false })
      // Başarılı giriş sonrası yönlendirme profile.tsx'de onAuthStateChange ile olacak
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    clearMessage() // Önceki mesajı temizle
    console.log('Attempting sign up with:', email)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      console.error('Sign up error:', error)
      setMessage({ text: error.message || 'Kayıt başarısız.', isError: true })
    } else if (!session) {
      console.log('Sign up successful, verification needed.')
      setMessage({
        text: 'Hesap oluşturuldu! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.',
        isError: false,
      })
    } else {
      console.log('Sign up successful, session received.')
      setMessage({ text: 'Hesap oluşturuldu ve giriş yapıldı!', isError: false })
      // Başarılı kayıt ve oturum sonrası yönlendirme profile.tsx'de onAuthStateChange ile olacak
    }
    setLoading(false)
  }

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Hoş Geldiniz</Text>
          <Text style={styles.subHeader}>Devam etmek için giriş yapın veya kayıt olun.</Text>

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
              leftIcon={{ type: 'font-awesome', name: 'envelope', color: Colors.grey }}
              onChangeText={(text: string) => {
                setEmail(text)
                clearMessage() // Yazmaya başlayınca mesajı temizle
              }}
              value={email}
              placeholder="email@adresiniz.com"
              autoCapitalize={'none'}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              keyboardType="email-address"
            />

            <Input
              label="Şifre"
              labelStyle={styles.label}
              leftIcon={{ type: 'font-awesome', name: 'lock', color: Colors.grey }}
              onChangeText={(text: string) => {
                setPassword(text)
                clearMessage() // Yazmaya başlayınca mesajı temizle
              }}
              value={password}
              secureTextEntry={true}
              placeholder="Şifre"
              autoCapitalize={'none'}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
            />

            {/* Butonlar ve Yükleniyor Göstergesi */}
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
            ) : (
              <View style={styles.buttonGroup}>
                <Button
                  title="Giriş Yap"
                  onPress={() => signInWithEmail()}
                  buttonStyle={styles.button}
                  titleStyle={styles.buttonTitle}
                  containerStyle={styles.buttonContainer}
                />
                <Button
                  title="Kayıt Ol"
                  onPress={() => signUpWithEmail()}
                  buttonStyle={[styles.button, styles.buttonOutline]}
                  titleStyle={[styles.buttonTitle, styles.buttonOutlineTitle]}
                  containerStyle={styles.buttonContainer}
                />
              </View>
            )}
          </Card>
        </View>
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
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 30,
    textAlign: 'center',
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
  inputText: {
    color: Colors.black,
    fontSize: 16,
  },
  spinner: {
    marginVertical: 20,
  },
  buttonGroup: {
    marginTop: 10,
  },
  buttonContainer: {
    marginBottom: 10,
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
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  buttonOutlineTitle: {
    color: Colors.primary,
  },
})