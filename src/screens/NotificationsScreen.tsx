import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { Bell, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/guild';
import { theme } from '../theme';

export function NotificationsScreen() {
  const { refresh } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getNotifications();
      setItems(Array.isArray(data) ? data : data?.notifications || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load notifications.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => loadData();

  const handleMarkAll = async () => {
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={24} color={theme.colors.gold} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>Votes, transfers, approvals and more.</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
          <CheckCircle size={16} color={theme.colors.gold} />
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Bell size={48} color={theme.colors.textDim} />
          <Text style={styles.emptyTitle}>You're all caught up</Text>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {items.map((n) => (
            <Card key={n._id} style={[styles.notificationCard, !n.isRead && styles.notificationUnread] as any}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>{n.message}</Text>
                <Text style={styles.notificationTime}>
                  {new Date(n.createdAt).toLocaleString()}
                </Text>
              </View>
              {!n.isRead && <View style={styles.unreadDot} />}
            </Card>
          ))}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  markAllText: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  notificationCard: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notificationUnread: {
    borderColor: theme.colors.gold + '4D',
    backgroundColor: theme.colors.surface + 'AA',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  notificationTime: {
    color: theme.colors.textDim,
    fontSize: 11,
    marginTop: theme.spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gold,
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '800',
    marginTop: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});