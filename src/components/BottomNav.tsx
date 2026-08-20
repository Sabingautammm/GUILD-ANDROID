import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Home, Trophy, User } from 'lucide-react-native';
import { theme } from '../theme';

interface BottomNavProps {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
  { id: 'profile', label: 'Profile', Icon: User },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const Icon = tab.Icon;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.7}
          >
            <Icon size={22} color={isActive ? theme.colors.gold : theme.colors.textDim} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 6,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    color: theme.colors.textDim,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  labelActive: {
    color: theme.colors.gold,
    fontWeight: '800',
  },
});
