import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store/index';
import Navigation from './src/navigation/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadAssignments } from './src/store/assignmentsSlice';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load theme preference
        const savedTheme = await AsyncStorage.getItem('@theme_mode');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }

        // Load assignments from AsyncStorage
        store.dispatch(loadAssignments());
        
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('@theme_mode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const lightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#6750A4',
      primaryContainer: '#EADDFF',
      secondary: '#625B71',
      secondaryContainer: '#E8DEF8',
      tertiary: '#7D5260',
      tertiaryContainer: '#FFD8E4',
      error: '#B3261E',
      errorContainer: '#F9DEDC',
      background: '#FFFBFE',
      surface: '#FFFBFE',
      surfaceVariant: '#E7E0EC',
      onPrimary: '#FFFFFF',
      onPrimaryContainer: '#21005E',
      onSecondary: '#FFFFFF',
      onSecondaryContainer: '#1E192B',
      onTertiary: '#FFFFFF',
      onTertiaryContainer: '#370B1E',
      onError: '#FFFFFF',
      onErrorContainer: '#410002',
      onBackground: '#1C1B1F',
      onSurface: '#1C1B1F',
      onSurfaceVariant: '#49454F',
    },
  };

  const darkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#D0BCFF',
      primaryContainer: '#4F378B',
      secondary: '#CCC2DC',
      secondaryContainer: '#4A4458',
      tertiary: '#EFB8C8',
      tertiaryContainer: '#633B48',
      error: '#F2B8B5',
      errorContainer: '#8C1D18',
      background: '#1C1B1F',
      surface: '#1C1B1F',
      surfaceVariant: '#49454F',
      onPrimary: '#381E72',
      onPrimaryContainer: '#EADDFF',
      onSecondary: '#332D41',
      onSecondaryContainer: '#E8DEF8',
      onTertiary: '#492532',
      onTertiaryContainer: '#FFD8E4',
      onError: '#601410',
      onErrorContainer: '#F9DEDC',
      onBackground: '#E6E1E5',
      onSurface: '#E6E1E5',
      onSurfaceVariant: '#CAC4D0',
    },
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (isLoading) {
    return null; // Or a splash screen component
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <Navigation isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </PaperProvider>
    </ReduxProvider>
  );
}