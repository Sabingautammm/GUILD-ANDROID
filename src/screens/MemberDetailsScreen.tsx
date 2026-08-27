import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { ArrowLeft, User, AlertCircle } from 'lucide-react-native';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getMemberById } from '../services/guild';
import { theme } from '../theme';

interface Member {
  _id: string;
  uid: string;
  inGameName?: string;
  avatar?: string;
  level?: number;
  role: string;
  status?: string;
  joinDate?: string;
  createdAt?: string;
}

export function MemberDetailsScreen({ route }: { route: { params: { memberId: string } } }) {
  const { memberId } = route.params;
  const { membership, role } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMemberById(memberId)
      .then((d) => !cancelled && setMember(d))
      .catch((err) => !cancelled && setError(err?.message || 'Could not load member.'))
      .finally(() => !cancelled && setIsLoading(false));
    return () => { cancelled = true; };
  }, [memberId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.gold} />
          <Text style={styles.errorText}>{error ?? 'Member not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const amLeader = membership?.role === 'leader' || role === 'leader' || role === 'acting_leader';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backButton} />

      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          {member.avatar ? (
            <Avatar src={member.avatar} name={member.inGameName} size={80} />
          ) : (
            <View style={[styles.avatarFallback, { width: 80, height: 80, borderRadius: 40 }]}>
              <Text style={[styles.avatarFallbackText, { fontSize: 32 }]}>
                {(member.inGameName || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.name}>{member.inGameName || 'Unknown'}</Text>
          <Text style={styles.role}>{member.role}</Text>
          <Text style={styles.uidText}>UID {member.uid}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatBox label="Level" value={String(member.level || 1)} Icon={User} color={theme.colors.gold} />
        <StatBox label="Status" value={member.status || 'Active'} Icon={User} color={theme.colors.gold} />
        <StatBox label="Joined" value={new Date(member.joinDate ?? member.createdAt ?? Date.now()).toLocaleDateString()} Icon={User} color={theme.colors.gold} />
      </View>

      {amLeader && (
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Admin actions</Text>
          <Button
            title="Kick member"
            variant="danger"
            size="md"
            onPress={() => {
              Alert.alert('Kick member', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Kick', style: 'destructive', onPress: () => {} },
              ]);
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function StatBox({ label, value, Icon, color }: { label: string; value: string; Icon: any; color: string }) {
  return (
    <View style={styles.statBox}>
      <Icon size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    zIndex: 10,
    padding: theme.spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  avatarWrapper: {
    marginBottom: theme.spacing.md,
  },
  avatarFallback: {
    backgroundColor: theme.colors.gold + '1A',
    borderWidth: 2,
    borderColor: theme.colors.gold + '4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: theme.colors.gold,
    fontWeight: '800',
  },
  nameBlock: {
    alignItems: 'center',
  },
  name: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  role: {
    color: theme.colors.gold,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  uidText: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dangerZone: {
    backgroundColor: theme.colors.danger + '1A',
    borderWidth: 1,
    borderColor: theme.colors.danger + '4D',
    borderRadius: theme.radius.lg,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dangerTitle: {
    color: theme.colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});