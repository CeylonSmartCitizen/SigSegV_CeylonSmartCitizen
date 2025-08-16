import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox } from 'react-native';

import { store, persistor } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import i18n from './src/i18n/i18n';
import { theme } from './src/constants/theme';
import LoadingScreen from './src/components/common/LoadingScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: ...',
  'Remote debugger',
  'Require cycle:',
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Prepare app resources
    const prepareApp = async () => {
      try {
        // Add any initialization logic here
        // e.g., font loading, initial API calls, etc.
        
        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Error during app initialization:', error);
      }
    };

    prepareApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <I18nextProvider i18n={i18n}>
            <PaperProvider theme={theme}>
              <SafeAreaProvider>
                <AppNavigator />
                <StatusBar style="auto" />
              </SafeAreaProvider>
            </PaperProvider>
          </I18nextProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
