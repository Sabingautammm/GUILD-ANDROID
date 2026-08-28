import { apiFetch } from './client';

export interface Guild {
  guildUid: string;
  name: string;
  slogan?: string;
  avatar?: string;
  leaderName?: string;
  memberCount?: number;
  score?: number;
  introduction?: string;
  history?: string;
}

export interface PlayerProfile {
  personalUid: string;
  gameUid?: string;
  inGameName?: string;
  region?: string;
  avatar?: string;
  role?: string;
  guildUid?: string;
  guildName?: string;
  playerRank?: number;
  stats?: {
    brRank?: any;
    csRank?: any;
    clashSquadCustom?: any;
  };
  liveRank?: {
    br?: any;
    cs?: any;
  };
  primeLevel?: number;
  primePoints?: number;
  likes?: number;
}

export function getTopGuilds() {
  return apiFetch<{ guilds: Guild[] }>('/leaderboards/guilds');
}

export function getPlayerLeaderboard() {
  return apiFetch<{ players: any[] }>('/leaderboards/players');
}

export function getGuildProfile(guildUid: string) {
  return apiFetch<{ guild: Guild; roster: any[] }>(`/guild/${guildUid}`);
}

export function getMyProfile() {
  return apiFetch<PlayerProfile>('/players/me');
}

export function getMediaFeed() {
  return apiFetch<{ media: any[] }>('/media');
}

export function getNotifications() {
  return apiFetch<{ notifications: any[] }>('/notifications');
}

export function getGuildLeaderboard() {
  return apiFetch<Guild[]>(`/leaderboards/guilds`);
}

export function getPrivateGuildView(guildUid: string) {
  return apiFetch<{ guild: Guild; roster: any[] }>(`/guild/${guildUid}/private`);
}

export function applyToGuild(guildUid: string) {
  return apiFetch<any>(`/guild/${guildUid}/apply`, { method: 'POST' });
}

export function leaveGuild(guildUid: string) {
  return apiFetch<any>(`/guild/${guildUid}/leave`, { method: 'POST' });
}

export function updateGuild(guildUid: string, data: { introduction?: string; history?: string }) {
  return apiFetch<any>(`/guild/${guildUid}`, { method: 'PATCH', body: data });
}

export function getMemberById(memberId: string) {
  return apiFetch<any>(`/members/${memberId}`);
}

export function getMedia(params?: { guildUid?: string; playerUid?: string; type?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.guildUid) query.set('guildUid', params.guildUid);
  if (params?.playerUid) query.set('playerUid', params.playerUid);
  if (params?.type) query.set('type', params.type);
  if (params?.limit) query.set('limit', String(params.limit));
  return apiFetch<any[]>(`/media?${query.toString()}`);
}

export function uploadMedia(file: FormData) {
  return apiFetch<any>('/media/upload', { method: 'POST', body: file });
}
