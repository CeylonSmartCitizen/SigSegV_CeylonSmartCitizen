import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import QueueDashboardScreen from '../screens/queue/QueueDashboardScreen';
import QueuePositionScreen from '../screens/queue/QueuePositionScreen';
import DocumentUploadScreen from '../screens/documents/DocumentUploadScreen';

const Stack = createStackNavigator();

const QueueNavigator = () => {
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
        name="QueueDashboard"
        component={QueueDashboardScreen}
        options={{ title: 'Queue Status' }}
      />
      <Stack.Screen
        name="QueuePosition"
        component={QueuePositionScreen}
        options={{ title: 'Queue Position' }}
      />
      <Stack.Screen
        name="DocumentUpload"
        component={DocumentUploadScreen}
        options={{ title: 'Upload Documents' }}
      />
    </Stack.Navigator>
  );
};

export default QueueNavigator;
