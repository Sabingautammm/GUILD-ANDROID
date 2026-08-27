import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Search, Users, AlertCircle, Clock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Guild, getGuildLeaderboard, applyToGuild } from '../services/guild';
import { theme } from '../theme';

export function MembersScreen() {
  const { isAuthenticated, role, membership, refresh } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getGuildLeaderboard();
      setGuilds(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Could not load guilds.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    loadData();
  };

  const handleApply = async (guildUid: string) => {
    if (!isAuthenticated) return;
    try {
      await applyToGuild(guildUid);
      await refresh();
    } catch {
      // error handled by API
    }
  };

  const isFree = isAuthenticated && role === 'free';
  const pending = membership && membership.hasPendingApplication;
  const activeGuild = membership && membership.hasActiveGuild;

  if (pending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Clock size={64} color={theme.colors.gold} />
          <Text style={styles.pendingTitle}>Application pending</Text>
          <Text style={styles.pendingText}>
            Your request to join guild {membership.guildUid} is awaiting approval by the guild's admins.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (activeGuild) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.pendingTitle}>Already in a guild</Text>
          <Text style={styles.pendingText}>Navigate to the Guild tab to see your guild.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filtered = guilds.filter(
    (g) =>
      (!query || g.guildUid.includes(query.replace(/\D/g, ''))) &&
      (!query || g.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Find a guild</Text>
          <Text style={styles.subtitle}>Search by Guild UID or name, then apply to join.</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={theme.colors.textDim} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search Guild UID or name…"
          placeholderTextColor={theme.colors.textDim}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.gold} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Users size={48} color={theme.colors.textDim} />
          <Text style={styles.emptyText}>
            No guilds found.{isAuthenticated && ' Whoever creates a UID first becomes its Leader.'}
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={filtered}
          keyExtractor={(g) => g.guildUid}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.guildCard}
              onPress={() => {}}
            >
              <View style={styles.guildCardHeader}>
                <View style={styles.guildAvatar}>
                  <Text style={styles.guildAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.guildInfo}>
                  <Text style={styles.guildName}>{item.name}</Text>
                  <Text style={styles.guildUidText}>UID {item.guildUid}</Text>
                </View>
              </View>
              <Text style={styles.guildSlogan}>{item.slogan || 'No description'}</Text>
              <View style={styles.guildFooter}>
                <View style={styles.guildMeta}>
                  <Users size={12} color={theme.colors.textDim} />
                  <Text style={styles.guildMetaText}>{item.memberCount ?? '…'} active</Text>
                </View>
                {isFree && (
                  <Button
                    title="Apply"
                    variant="gold"
                    size="sm"
                    onPress={() => handleApply(item.guildUid)}
                    style={styles.applyButton}
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No guilds match your search.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
    padding: theme.spacing.lg,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    margin: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    paddingVertical: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  guildCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  guildCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  guildAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gold + '1A',
    borderWidth: 1,
    borderColor: theme.colors.gold + '4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guildAvatarText: {
    color: theme.colors.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  guildInfo: {
    flex: 1,
  },
  guildName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  guildUidText: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  guildSlogan: {
    color: theme.colors.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
  guildFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  guildMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guildMetaText: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  applyButton: {
    minWidth: 80,
  },
  pendingTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  pendingText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});