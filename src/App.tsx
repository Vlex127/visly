import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { useAuthStore } from './stores/authStore';
import { setupNotifications } from './services/notificationService';
import { initializeDatabase } from './services/databaseService';
import AuthStack from './navigation/AuthStack';
import MainStack from './navigation/MainStack';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      await initializeDatabase();
      await setupNotifications();
      await initializeAuth();
    };
    initialize();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? <MainStack /> : <AuthStack />}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}