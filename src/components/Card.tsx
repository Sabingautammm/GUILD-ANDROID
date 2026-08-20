import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'surface' | 'outlined';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  elevated: {
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
