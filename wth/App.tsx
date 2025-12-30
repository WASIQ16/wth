import React from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function App() {
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
