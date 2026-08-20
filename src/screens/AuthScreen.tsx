import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/googleAuth';
import { theme } from '../theme';

export function AuthScreen() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const idToken = await signInWithGoogle();
      await loginWithGoogle(idToken);
    } catch (err: any) {
      if (err?.code !== 'SIGN_IN_CANCELLED') {
        setError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.badge}>ESPORTS PLATFORM</Text>
          <Text style={styles.title}>GUILD</Text>
          <Text style={styles.subtitle}>
            Connect your Free Fire identity, build your squad, compete on live leaderboards.
          </Text>
        </View>

        <View style={styles.actionBlock}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Continue with Google"
            variant="gold"
            size="lg"
            loading={loading}
            onPress={handleSignIn}
          />

          <Text style={styles.hint}>
            Select your Google account to sign in. Leaders verify ownership after entering.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: theme.spacing.xxl,
  },
  badge: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  actionBlock: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  hint: {
    color: theme.colors.textDim,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: theme.spacing.xs,
  },
});
