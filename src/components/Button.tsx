import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!isInteractive}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'gold' ? '#0c0a07' : '#ffffff'} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    minHeight: 56,
  },
  text_sm: {
    fontSize: 13,
  },
  text_md: {
    fontSize: 15,
  },
  text_lg: {
    fontSize: 17,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  text_primary: {
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text_secondary: {
    color: theme.colors.text,
  },
  gold: {
    backgroundColor: theme.colors.gold,
  },
  text_gold: {
    color: '#0c0a07',
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  text_danger: {
    color: '#ffffff',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text_ghost: {
    color: theme.colors.textMuted,
  },
  disabled: {
    opacity: 0.5,
  },
});
