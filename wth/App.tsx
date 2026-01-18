import React, { useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, PermissionsAndroid, Platform, Alert } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function App() {
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'WTH Services needs access to your microphone to provide voice-to-text features.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Microphone permission granted');
          } else {
            console.log('Microphone permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestMicrophonePermission();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppWithStatusBar />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppWithStatusBar() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar
        backgroundColor={isDarkMode ? '#000000' : '#253D2C'}
        barStyle={isDarkMode ? 'light-content' : 'light-content'}
        translucent={false}
      />
      <RootNavigator />
    </>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen templateFileName="App.tsx" safeAreaInsets={safeAreaInsets} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 20,
  },
});

export default App;
