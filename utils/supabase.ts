import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = "https://zhvcyqbnjnukvsnnfvhl.supabase.co"
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodmN5cWJuam51a3Zzbm5mdmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDcwMjIsImV4cCI6MjA2Mzc4MzAyMn0.bPc0ijr905KJqnKlsqrBw8wBfoQ7hcaZNa2xJ13s9zw'

const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})