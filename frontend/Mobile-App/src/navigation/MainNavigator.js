import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ServicesNavigator from './ServicesNavigator';
import QueueNavigator from './QueueNavigator';
import NotificationsNavigator from './NotificationsNavigator';
import ProfileNavigator from './ProfileNavigator';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'ServicesTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'QueueTab') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'NotificationsTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen
        name="ServicesTab"
        component={ServicesNavigator}
        options={{
          tabBarLabel: t('services'),
        }}
      />
      <Tab.Screen
        name="QueueTab"
        component={QueueNavigator}
        options={{
          tabBarLabel: t('queue'),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsNavigator}
        options={{
          tabBarLabel: t('notifications'),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: t('profile'),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
