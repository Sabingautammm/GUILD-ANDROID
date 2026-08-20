import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
}

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ src, name, size = 48 }: AvatarProps) {
  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surfaceAlt,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: theme.colors.surface,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  initials: {
    color: theme.colors.gold,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
