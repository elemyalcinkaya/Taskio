/**
 * Taskio - Görev Yönetim Uygulaması
 * React Native Entry Point
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F1221" />
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;
