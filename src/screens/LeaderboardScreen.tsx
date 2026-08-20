import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { Guild, getTopGuilds } from '../services/guild';
import { theme } from '../theme';

export function LeaderboardScreen() {
  const [tab, setTab] = useState<'guilds' | 'players'>('guilds');
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const guildData = await getTopGuilds();
      setGuilds(guildData.guilds || []);
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
      <View style={styles.tabs}>
        <TabButton title="Guilds" active={tab === 'guilds'} onPress={() => setTab('guilds')} />
        <TabButton title="Players" active={tab === 'players'} onPress={() => setTab('players')} />
      </View>

      {tab === 'guilds' ? (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={guilds}
          keyExtractor={(g) => g.guildUid}
          renderItem={({ item, index }) => (
            <Card style={styles.row}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Avatar src={item.avatar} name={item.name} size={40} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.memberCount || 0} members</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.score}>{item.score || 0}</Text>
                <Text style={styles.scoreLabel}>PTS</Text>
              </View>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.gold}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No guilds yet. Be the first to create one!</Text>
          }
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.empty}>Player leaderboard coming soon.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function TabButton({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return (
    <Text
      onPress={onPress}
      style={[
        styles.tabButton,
        active && styles.tabButtonActive,
      ]}
    >
      {title}
    </Text>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    color: theme.colors.textDim,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tabButtonActive: {
    color: theme.colors.gold,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.gold,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  rank: {
    color: theme.colors.gold,
    fontWeight: '800',
    fontSize: 16,
    width: 32,
  },
  info: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  sub: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBox: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius.sm,
  },
  score: {
    color: theme.colors.gold,
    fontWeight: '800',
    fontSize: 16,
  },
  scoreLabel: {
    color: theme.colors.textDim,
    fontSize: 10,
    letterSpacing: 1,
  },
  empty: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
});
