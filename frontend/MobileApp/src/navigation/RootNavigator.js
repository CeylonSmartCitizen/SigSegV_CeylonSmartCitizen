import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import authStack from './authStack'; // Ensure the filename matches the actual file
import MainTabNavigator from './MainTabNavigator';
import linkingConfig from './linkingConfig';

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace this with real auth check
    setTimeout(() => {
      setIsAuthenticated(true);
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    // You can replace this with a custom loading spinner
    return null;
  }

  return (
    <NavigationContainer linking={linkingConfig}>
      {isAuthenticated ? <MainTabNavigator /> : <authStack />}
    </NavigationContainer>
  );
}