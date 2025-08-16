// App.tsx
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import LanguageSwitcher from './src/components/common/LanguageSwitcher';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load saved language preference
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    setCurrentLanguage(languageCode);
    try {
      await AsyncStorage.setItem('language', languageCode);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.languageSwitcherContainer}>
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </View>
        <AppNavigator />
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
});
