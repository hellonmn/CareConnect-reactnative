import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

// Import your custom SVG icons
import CalendarIcon from '../../assets/images/icons/calendar.svg';
import ChatIcon from '../../assets/images/icons/comments.svg';
import HomeIcon from '../../assets/images/icons/house-window.svg';
import ExploreIcon from '../../assets/images/icons/star.svg';
import UserIcon from '../../assets/images/icons/user.svg';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0694a2',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 15,
            height: 70,
          },
          android: {
            position: 'absolute',
            bottom: 0,
            paddingTop: 5,
            left: 20,
            right: 20,
            backgroundColor: '#FFFFFF',
            height: 70,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon width={24} height={24} fill={color} />,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      />
      <Tabs.Screen
        name="aiChat"
        options={{
          title: 'Dr Care',
          tabBarIcon: ({ color }) => <ChatIcon width={24} height={24} fill={color} />,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <ExploreIcon width={24} height={24} fill={color} />,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => <CalendarIcon width={24} height={24} fill={color} />,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon width={24} height={24} fill={color} />,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      />
    </Tabs>
  );
}
