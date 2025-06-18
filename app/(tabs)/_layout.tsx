import { Tabs, Route } from 'expo-router';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'exercises') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'myprogram') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.tabIconSelected,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          },
        tabBarStyle: { backgroundColor: Colors.white },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Hareketler',
        }}
      />
      <Tabs.Screen
        name="myprogram"
        options={{
          title: 'Programım',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Ben',
        }}
      />
    </Tabs>
  );
}
