import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { PlayerProfile, getMyProfile } from '../services/guild';
import { theme } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of GUILD?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Profile */}
        <View style={styles.header}>
          <Avatar src={user?.avatar} name={user?.name} size={72} />
          <Text style={styles.name}>
            {profile?.inGameName || user?.inGameName || user?.name || 'Player'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {profile?.guildName && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{profile.guildName}</Text>
            </View>
          )}
        </View>

        {/* Identity Details */}
        <Text style={styles.sectionTitle}>GAME IDENTITY</Text>
        <Card style={styles.card}>
          <Row label="Game" value="Free Fire" />
          <Row label="UID" value={user?.gameUid || '—'} />
          <Row label="Region" value={user?.region || '—'} />
          <Row label="Role" value={profile?.role || 'Member'} />
        </Card>

        {/* Account Actions */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Card style={styles.card}>
          <Button
            title="Sign Out"
            variant="danger"
            size="md"
            onPress={handleLogout}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
    gap: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: theme.spacing.md,
  },
  email: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    marginTop: theme.spacing.sm,
  },
  badgeText: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: theme.spacing.sm,
  },
  card: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
