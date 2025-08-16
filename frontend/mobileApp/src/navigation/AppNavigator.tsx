// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import QueueDashboardScreen from '../components/queue/QueueDashboardScreen';
import DocumentUploadScreen from '../screen/documents/DocumentUploadScreen';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const QueueStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="QueueDashboard"
      component={QueueDashboardScreen}
      options={{ title: 'Queue Status' }}
    />
  </Stack.Navigator>
);

const DocumentStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="DocumentUpload"
      component={DocumentUploadScreen}
      options={{ title: 'Upload Documents' }}
    />
  </Stack.Navigator>
);

const NotificationStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Notifications"
      component={NotificationCenter}
      options={{ title: 'Notifications' }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Queue') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Documents') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Notifications') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Queue" component={QueueStack} />
        <Tab.Screen name="Documents" component={DocumentStack} />
        <Tab.Screen name="Notifications" component={NotificationStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
