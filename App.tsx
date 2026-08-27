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
import { MembersScreen } from './src/screens/MembersScreen';
import { GuildDetailsScreen } from './src/screens/GuildDetailsScreen';
import { MemberDetailsScreen } from './src/screens/MemberDetailsScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';
import { ReelScreen } from './src/screens/ReelScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { initGoogleSignIn } from './src/services/googleAuth';
import { theme } from './src/theme';

function MainApp() {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [guildUid, setGuildUid] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

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

  const activeScreen = () => {
    if (guildUid) return <GuildDetailsScreen route={{ params: { guildUid } }} />;
    if (memberId) return <MemberDetailsScreen route={{ params: { memberId } }} />;
    switch (activeTab) {
      case 'home': return <HomeScreen onNavigate={setActiveTab} />;
      case 'leaderboard': return <LeaderboardScreen />;
      case 'members': return <MembersScreen />;
      case 'guild': return <MembersScreen />;
      case 'gallery': return <GalleryScreen />;
      case 'reel': return <ReelScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'admin': return <AdminScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        {activeScreen()}
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
