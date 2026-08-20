import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Guild, PlayerProfile, getMyProfile, getTopGuilds } from '../services/guild';
import { theme } from '../theme';

export function HomeScreen({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [profData, guildData] = await Promise.allSettled([
        getMyProfile(),
        getTopGuilds(),
      ]);
      if (profData.status === 'fulfilled') setProfile(profData.value);
      if (guildData.status === 'fulfilled') setGuilds(guildData.value.guilds || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.gold}
          />
        }
      >
        {/* User Card */}
        <Card style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <Avatar src={user?.avatar} name={user?.name} size={54} />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {profile?.inGameName || user?.inGameName || user?.name || 'Player'}
              </Text>
              <Text style={styles.playerGuild}>
                {profile?.guildName ? `Guild: ${profile.guildName}` : 'No Guild'}
              </Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>
                #{profile?.playerRank && profile.playerRank > 0 ? profile.playerRank : '—'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>SEASON PERFORMANCE</Text>
        <View style={styles.statsGrid}>
          <StatBox label="BR K/D" value={profile?.stats?.brRank?.kd ?? '—'} />
          <StatBox label="BR WIN %" value={profile?.stats?.brRank?.winRate ? `${profile.stats.brRank.winRate}%` : '—'} />
          <StatBox label="CS STARS" value={profile?.stats?.csRank?.stars ?? '—'} />
          <StatBox label="CS WIN %" value={profile?.stats?.csRank?.winRate ? `${profile.stats.csRank.winRate}%` : '—'} />
        </View>

        {/* Top Guilds */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TOP GUILDS</Text>
          <TouchableOpacity onPress={() => onNavigate('leaderboard')}>
            <Text style={styles.viewAll}>View all →</Text>
          </TouchableOpacity>
        </View>

        {guilds.slice(0, 5).map((guild, idx) => (
          <Card key={guild.guildUid} style={styles.guildRow}>
            <View style={styles.guildRank}>
              <Text style={styles.guildRankText}>#{idx + 1}</Text>
            </View>
            <Avatar src={guild.avatar} name={guild.name} size={36} />
            <View style={styles.guildInfo}>
              <Text style={styles.guildName}>{guild.name}</Text>
              <Text style={styles.guildMembers}>{guild.memberCount || 0} Members</Text>
            </View>
            <Text style={styles.guildScore}>{guild.score || 0} pts</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{String(value)}</Text>
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
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  playerCard: {
    backgroundColor: theme.colors.bgElevated,
    borderColor: theme.colors.border,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  playerGuild: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  rankBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  rankText: {
    color: theme.colors.gold,
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  viewAll: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  guildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
  guildRank: {
    width: 28,
  },
  guildRankText: {
    color: theme.colors.gold,
    fontWeight: '800',
    fontSize: 14,
  },
  guildInfo: {
    flex: 1,
  },
  guildName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  guildMembers: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  guildScore: {
    color: theme.colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
});
