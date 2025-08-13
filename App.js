import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// Importez RootNavigation au lieu de AppNavigation, car c'est le composant qui encapsule les contextes.
import RootNavigation from './src/Navigation'; 
import * as NavigationBar from 'expo-navigation-bar';
import * as Updates from 'expo-updates';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#111');
      NavigationBar.setButtonStyleAsync('light');
    }
    const checkForOTA = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log('OTA update error:', e);
      }
    };
    checkForOTA();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#111" />
      {/* Rendu de RootNavigation qui contient toute votre logique de navigation et de contextes */}
      <RootNavigation />
    </SafeAreaProvider>
  );
}
