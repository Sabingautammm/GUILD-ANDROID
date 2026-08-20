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
