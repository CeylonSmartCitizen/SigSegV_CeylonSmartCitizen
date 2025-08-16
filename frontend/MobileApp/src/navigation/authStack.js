import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Updated import paths to match folder structure
import LoginScreen from '../screen/auth/LoginScreen';
import RegisterScreen from '../screen/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

