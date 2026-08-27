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
import { Shield, Users, Image, Clock, Activity, Search } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const tabs = [
  { key: 'members', label: 'Members', icon: Users },
  { key: 'guild', label: 'Guild Players', icon: Search },
  { key: 'media', label: 'Media', icon: Image },
  { key: 'pending', label: 'Pending Actions', icon: Clock },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'transfer', label: 'Leadership', icon: Shield },
];

export function AdminScreen() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const canLead = role === 'leader' || role === 'acting_leader';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Shield size={24} color={theme.colors.gold} />
        </View>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Your role: {role?.replace('_', ' ')}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Icon size={14} color={isActive ? theme.colors.bg : theme.colors.textDim} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!canLead && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            As an Officer you can act on kick/join/re-apply via the consensus queue and moderate media directly.
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Content for {activeTab} coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.gold + '1A',
    borderWidth: 1,
    borderColor: theme.colors.gold + '4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  tabs: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  tabLabel: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: theme.colors.bg,
    fontWeight: '800',
  },
  banner: {
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.gold + '4D',
    borderRadius: theme.radius.md,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  bannerText: {
    color: theme.colors.gold,
    fontSize: 12,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: theme.colors.textDim,
    fontSize: 14,
  },
});