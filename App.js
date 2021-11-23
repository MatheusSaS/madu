import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();
import StackNavigation from './StackNavigation';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider> 
        <StackNavigation />
      </AuthProvider>
    </NavigationContainer>    
  );
}

