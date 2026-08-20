import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BottomNav } from './src/components/BottomNav';
import { ToastProvider } from './src/components/Toast';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { initGoogleSignIn } from './src/services/googleAuth';
import { theme } from './src/theme';

function MainApp() {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (needsOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        {activeTab === 'home' && <HomeScreen onNavigate={setActiveTab} />}
        {activeTab === 'leaderboard' && <LeaderboardScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    initGoogleSignIn().catch((err) => {
      console.warn('Google Sign-In init error:', err);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
