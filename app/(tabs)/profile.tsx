import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
// import { Colors } from '../../constants/Colors'; // Stil şimdilik kaldırıldı, Auth/Account kendi stillerini getiriyor
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase'; // supabase istemcisini import et
import Auth from '../../components/Auth'; // Auth bileşenini import et
import Account from '../../components/Account'; // Account bileşenini import et



export default function ProfileScreen() {
  
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Başlangıçta oturumu al
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
    });

    // Oturum durumu değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange((
      _event: string,
      session: Session | null
    ) => {
      setSession(session);
    });

    // Component unmount olduğunda listener'ı kaldır
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    // Bu View'ın tüm ekranı kaplamasını ve beyaz arka plana sahip olmasını sağla
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {session && session.user ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <Auth />
      )}
    </View>
  );
}

// Mevcut stiller şimdilik kaldırıldı, gerekirse geri eklenebilir veya Auth/Account bileşenlerindeki stiller kullanılabilir.
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.background,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: Colors.primary,
//   },
// }); 