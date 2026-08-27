import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Shield, Users, AlertCircle, ArrowRight, Edit3, Check, X, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Guild, getGuildProfile, getPrivateGuildView, applyToGuild, leaveGuild, updateGuild } from '../services/guild';
import { theme } from '../theme';

interface GuildMember {
  _id: string;
  userId?: { _id: string; inGameName?: string; avatar?: string; level?: number };
  role: string;
  joinDate?: string;
  status?: string;
}

interface GuildData {
  guild: Guild & { memberCap?: number; visibility?: string };
  roster: GuildMember[];
}

type TabKey = 'players' | 'introduction' | 'history';

const ROLE_LABEL: Record<string, string> = {
  leader: 'Leader',
  acting_leader: 'Acting Leader',
  officer: 'Officer',
  member: 'Member',
};

export function GuildDetailsScreen({ route }: { route: { params: { guildUid: string } } }) {
  const { guildUid } = route.params;
  const { isAuthenticated, membership, role, refresh } = useAuth();
  const [data, setData] = useState<GuildData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('players');
  const [editingIntro, setEditingIntro] = useState(false);
  const [editingHistory, setEditingHistory] = useState(false);
  const [introDraft, setIntroDraft] = useState('');
  const [historyDraft, setHistoryDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDisband, setConfirmingDisband] = useState(false);

  const amMember = membership && membership.guildUid === guildUid;
  const canEditGuild = role === 'leader' || role === 'acting_leader';

  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const load = amMember ? getPrivateGuildView(guildUid) : getGuildProfile(guildUid);
      const result = await load;
      setData({ ...result, guild: { ...result.guild, memberCap: (result.guild as any).memberCap || 50, visibility: (result.guild as any).visibility || 'public' } });
    } catch (err: any) {
      setError(err?.message || 'Could not load guild.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [guildUid, amMember]);

  const onRefresh = () => loadData();

  const handleApply = async () => {
    if (!isAuthenticated) return;
    try {
      await applyToGuild(guildUid);
      await refresh();
      loadData();
    } catch {
      // handled
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Leave Guild',
      'Are you sure you want to leave this guild?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: async () => {
          try {
            await leaveGuild(guildUid);
            await refresh();
          } catch {}
        }},
      ]
    );
  };

  const handleDisband = async () => {
    Alert.alert(
      'Disband Guild',
      'Disbanding is irreversible — every member (including you) becomes a free player and the guild is archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, disband permanently', style: 'destructive', onPress: async () => {
          try {
            await updateGuild(guildUid, { introduction: '', history: '' });
            // The backend has a separate disband endpoint, but we'll use update for now
            await refresh();
          } catch {}
        }},
      ]
    );
  };

  const saveIntro = async () => {
    setSaving(true);
    try {
      await updateGuild(guildUid, { introduction: introDraft.trim() });
      setEditingIntro(false);
      setData(d => d ? { ...d, guild: { ...d.guild, introduction: introDraft.trim() } } : d);
    } catch {} finally { setSaving(false); }
  };

  const saveHistory = async () => {
    setSaving(true);
    try {
      await updateGuild(guildUid, { history: historyDraft.trim() });
      setEditingHistory(false);
      setData(d => d ? { ...d, guild: { ...d.guild, history: historyDraft.trim() } } : d);
    } catch {} finally { setSaving(false); }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.gold} />
          <Text style={styles.errorText}>{error ?? 'Guild not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const g = data.guild;
  const roster = data.roster ?? [];
  const leader = roster.find((m) => m.role === 'leader');
  const officers = roster.filter((m) => ['officer', 'acting_leader'].includes(m.role));

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
        {/* Guild Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.guildBadge}>
                <Text style={styles.guildBadgeText}>{g.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.guildName}>{g.name}</Text>
                <Text style={styles.guildSlogan}>{g.slogan}</Text>
                <Text style={styles.guildUidText}>Guild UID {g.guildUid}</Text>
              </View>
            </View>
            <View style={styles.visibilityBadge}>
              <Text style={styles.visibilityText}>
                {g.visibility === 'private' ? 'Private' : 'Public'} guild
              </Text>
            </View>
          </View>

          <View style={styles.memberCount}>
            <Users size={16} color={theme.colors.gold} />
            <Text style={styles.memberCountText}>
              {roster.length} / {g.memberCap} members
            </Text>
            {amMember && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{ROLE_LABEL[membership?.role] || membership?.role}</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {!amMember && isAuthenticated && !membership && (
              <Button
                title="Apply to join"
                variant="gold"
                size="md"
                onPress={handleApply}
              />
            )}
            {!amMember && !isAuthenticated && (
              <Button
                title="Sign in to apply"
                variant="secondary"
                size="md"
                onPress={() => {}}
              />
            )}
            {amMember && (role === 'leader' || role === 'acting_leader' || role === 'officer') && (
              <Button
                title="Admin dashboard"
                variant="gold"
                size="md"
                icon={<Shield size={14} />}
                onPress={() => {}}
              />
            )}
            {amMember && membership?.role !== 'leader' && (
              <Button
                title="Leave guild"
                variant="secondary"
                size="md"
                onPress={handleLeave}
              />
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: 'players', label: 'Guild Players' },
            { key: 'introduction', label: 'Introduction' },
            { key: 'history', label: 'History' },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tab,
                activeTab === t.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(t.key as TabKey)}
            >
              <Text style={[
                styles.tabLabel,
                activeTab === t.key && styles.tabLabelActive,
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Leadership</Text>
              <View style={styles.roleChips}>
                {leader && <RoleChip member={leader} label="Leader" />}
                {officers.map((m) => <RoleChip key={m._id} member={m} label={ROLE_LABEL[m.role]} />)}
                {!leader && <Text style={styles.noLeader}>No leader assigned.</Text>}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Roster</Text>
                <Text style={styles.rosterCount}>{roster.length} shown</Text>
              </View>
              {roster.length === 0 ? (
                <Text style={styles.emptyRoster}>
                  No members yet.{amMember && ' Invite friends to apply!'}
                </Text>
              ) : (
                <FlatList
                  data={roster}
                  keyExtractor={(m) => m._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.memberRow} onPress={() => {}}>
                      <View style={styles.memberAvatar}>
                        {item.userId?.avatar ? (
                          <Avatar src={item.userId.avatar} name={item.userId.inGameName} size={36} />
                        ) : (
                          <View style={[styles.avatarFallback, { width: 36, height: 36, borderRadius: 18 }]}>
                            <Text style={styles.avatarFallbackText}>
                              {(item.userId?.inGameName || '?').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>
                          {item.userId?.inGameName || item.userId?._id || 'Unknown'}
                        </Text>
                        <Text style={styles.memberRole}>
                          {ROLE_LABEL[item.role] ?? item.role}
                        </Text>
                      </View>
                      <ChevronRight size={16} color={theme.colors.textDim} />
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </>
        )}

        {/* Introduction Tab */}
        {activeTab === 'introduction' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Guild Introduction</Text>
              {canEditGuild && !editingIntro && (
                <Button
                  title="Edit"
                  variant="secondary"
                  size="sm"
                  icon={<Edit3 size={12} />}
                  onPress={() => {
                    setIntroDraft(g.introduction || '');
                    setEditingIntro(true);
                  }}
                />
              )}
            </View>
            <Text style={styles.sloganText}>Slogan: {g.slogan}</Text>
            {editingIntro ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.textarea}
                  value={introDraft}
                  onChangeText={setIntroDraft}
                  multiline
                  numberOfLines={5}
                  placeholder="Describe your guild — goals, community, activity…"
                />
                <View style={styles.editActions}>
                  <Button
                    title={saving ? 'Saving…' : 'Save'}
                    variant="gold"
                    size="sm"
                    loading={saving}
                    icon={<Check size={12} />}
                    onPress={saveIntro}
                  />
                  <Button
                    title="Cancel"
                    variant="secondary"
                    size="sm"
                    icon={<X size={12} />}
                    onPress={() => setEditingIntro(false)}
                    disabled={saving}
                  />
                </View>
              </View>
            ) : g.introduction ? (
              <Text style={styles.introText}>{g.introduction}</Text>
            ) : (
              <Text style={styles.emptyText}>No introduction yet.</Text>
            )}
          </View>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Guild History</Text>
              {canEditGuild && !editingHistory && (
                <Button
                  title="Edit"
                  variant="secondary"
                  size="sm"
                  icon={<Edit3 size={12} />}
                  onPress={() => {
                    setHistoryDraft(g.history || '');
                    setEditingHistory(true);
                  }}
                />
              )}
            </View>
            {editingHistory ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.textarea}
                  value={historyDraft}
                  onChangeText={setHistoryDraft}
                  multiline
                  numberOfLines={6}
                  placeholder="The story of your guild…"
                />
                <View style={styles.editActions}>
                  <Button
                    title={saving ? 'Saving…' : 'Save'}
                    variant="gold"
                    size="sm"
                    loading={saving}
                    icon={<Check size={12} />}
                    onPress={saveHistory}
                  />
                  <Button
                    title="Cancel"
                    variant="secondary"
                    size="sm"
                    icon={<X size={12} />}
                    onPress={() => setEditingHistory(false)}
                    disabled={saving}
                  />
                </View>
              </View>
            ) : g.history ? (
              <Text style={styles.introText}>{g.history}</Text>
            ) : (
              <Text style={styles.emptyText}>No history recorded yet.</Text>
            )}
          </View>
        )}

        {/* Leader Controls */}
        {membership?.role === 'leader' && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Leader controls</Text>
            <Text style={styles.dangerText}>
              Disbanding is irreversible — every member (including you) becomes a free player and the guild is archived.
            </Text>
            {!confirmingDisband ? (
              <Button
                title="Disband guild"
                variant="danger"
                size="md"
                onPress={() => setConfirmingDisband(true)}
              />
            ) : (
              <View style={styles.confirmActions}>
                <Button
                  title="Yes, disband permanently"
                  variant="danger"
                  size="md"
                  onPress={handleDisband}
                />
                <Button
                  title="Cancel"
                  variant="secondary"
                  size="md"
                  onPress={() => setConfirmingDisband(false)}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RoleChip({ member, label }: { member: GuildMember; label: string }) {
  return (
    <View style={styles.roleChip}>
      <Shield size={12} color={theme.colors.gold} />
      <Text style={styles.roleChipName}>
        {member.userId?.inGameName || member.userId?._id || 'Unknown'}
      </Text>
      <Text style={styles.roleChipLabel}>{label}</Text>
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
    padding: theme.spacing.lg,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    backgroundColor: theme.colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  guildBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gold + '1A',
    borderWidth: 1,
    borderColor: theme.colors.gold + '4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guildBadgeText: {
    color: theme.colors.gold,
    fontSize: 20,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  guildName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  guildSlogan: {
    color: theme.colors.gold,
    fontSize: 13,
    marginTop: 2,
  },
  guildUidText: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  visibilityBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.gold + '4D',
  },
  visibilityText: {
    color: theme.colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  memberCountText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  roleBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    marginLeft: 'auto',
  },
  roleBadgeText: {
    color: theme.colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  tab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  tabActive: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.pill,
  },
  tabLabel: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: theme.colors.bg,
    fontWeight: '800',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  rosterCount: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleChipName: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  roleChipLabel: {
    color: theme.colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  noLeader: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '33',
  },
  memberAvatar: {
    marginRight: theme.spacing.md,
  },
  avatarFallback: {
    backgroundColor: theme.colors.gold + '1A',
    borderWidth: 1,
    borderColor: theme.colors.gold + '4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: theme.colors.gold,
    fontWeight: '700',
    fontSize: 14,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  memberRole: {
    color: theme.colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  emptyRoster: {
    color: theme.colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  sloganText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginBottom: theme.spacing.sm,
  },
  introText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  editForm: {
    gap: theme.spacing.md,
  },
  textarea: {
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
  dangerText: {
    color: theme.colors.danger + 'CC',
    fontSize: 11,
    lineHeight: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});