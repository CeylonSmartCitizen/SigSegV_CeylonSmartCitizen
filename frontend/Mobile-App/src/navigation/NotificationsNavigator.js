import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import NotificationsListScreen from '../screens/notifications/NotificationsListScreen';
import NotificationDetailsScreen from '../screens/notifications/NotificationDetailsScreen';

const Stack = createStackNavigator();

const NotificationsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="NotificationsList"
        component={NotificationsListScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="NotificationDetails"
        component={NotificationDetailsScreen}
        options={{ title: 'Notification' }}
      />
    </Stack.Navigator>
  );
};

export default NotificationsNavigator;
