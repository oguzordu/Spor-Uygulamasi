/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2E7D32';
const tintColorDark = '#81C784';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    danger: '#D32F2F',
    lightGray: '#f0f0f0',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    danger: '#EF5350',
    lightGray: '#212121',
  },
  primary: '#2E7D32',      // Ana marka rengi (koyu yeşil)
  primaryMuted: '#E8F5E9',   // Ana rengin soluk versiyonu (açık yeşil arka plan)
  secondary: '#FFC107',     // İkincil, vurgu rengi (amber)
  background: '#F7F7F7',    // Genel uygulama arka planı (çok açık gri)
  white: '#FFFFFF',
  text: '#1C1C1E',          // Ana metin rengi (neredeyse siyah)
  textMuted: '#8E8E93',     // İkincil, soluk metin (gri)
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#2E7D32',
  error: '#D32F2F',         // Hata rengi (kırmızı)
  errorMuted: '#FFEBEE',    // Hata renginin soluk versiyonu
  card: '#FFFFFF',           // Kartların arka planı (beyaz)
  border: '#EFEFEF',        // Kenarlıklar için (açık gri)
} as const;
