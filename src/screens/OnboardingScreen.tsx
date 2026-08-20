import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding, submitUidRegion } from '../services/auth';
import { theme } from '../theme';

export function OnboardingScreen() {
  const { refresh } = useAuth();
  const [uid, setUid] = useState('');
  const [region, setRegion] = useState('IND');
  const [ffData, setFfData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await submitUidRegion(uid, region);
      setFfData(result?.data || result);
    } catch (err: any) {
      setError(err?.message || 'Could not fetch Free Fire profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);
      await completeOnboarding(ffData);
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Could not complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Connect Free Fire</Text>
          <Text style={styles.subtitle}>
            Enter your in-game UID and region. We'll fetch your stats automatically.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Free Fire UID</Text>
            <TextInput
              style={styles.input}
              value={uid}
              onChangeText={setUid}
              placeholder="e.g. 1234567890"
              placeholderTextColor={theme.colors.textDim}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Region</Text>
            <View style={styles.regionRow}>
              {['IND', 'BD', 'BR', 'US', 'ID', 'TH'].map((r) => (
                <Button
                  key={r}
                  title={r}
                  variant={region === r ? 'gold' : 'secondary'}
                  size="sm"
                  onPress={() => setRegion(r)}
                  style={{ marginRight: 6, marginBottom: 6 }}
                />
              ))}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {!ffData ? (
              <Button
                title={loading ? 'Fetching...' : 'Fetch Profile'}
                variant="primary"
                size="lg"
                loading={loading}
                onPress={handleFetchProfile}
                disabled={!uid.trim()}
              />
            ) : (
              <>
                <Card label="Nickname" value={ffData?.nickname || ffData?.inGameName || '—'} />
                <Card label="Level" value={String(ffData?.level || '—')} />
                <Card label="BR Tier" value={ffData?.brRank?.tier || ffData?.brRank?.rankName || '—'} />
                <Card label="CS Stars" value={String(ffData?.csRank?.stars ?? ffData?.csRank?.rankPoints ?? '—')} />

                <Button
                  title="Complete Onboarding"
                  variant="gold"
                  size="lg"
                  loading={loading}
                  onPress={handleComplete}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  regionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  cardValue: {
    color: theme.colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
});
