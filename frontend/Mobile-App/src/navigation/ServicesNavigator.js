import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ServicesListScreen from '../screens/services/ServicesListScreen';
import ServiceDetailsScreen from '../screens/services/ServiceDetailsScreen';
import BookingScreen from '../screens/appointments/BookingScreen';
import BookingConfirmationScreen from '../screens/appointments/BookingConfirmationScreen';

const Stack = createStackNavigator();

const ServicesNavigator = () => {
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
        name="ServicesList"
        component={ServicesListScreen}
        options={{ title: 'Services' }}
      />
      <Stack.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
        options={{ title: 'Service Details' }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: 'Book Appointment' }}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ title: 'Confirmation' }}
      />
    </Stack.Navigator>
  );
};

export default ServicesNavigator;
