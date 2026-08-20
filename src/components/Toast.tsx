import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  show: (options: ToastOptions | string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const timerRef = useRef<any>(null);

  const show = useCallback(
    (options: ToastOptions | string) => {
      const opts: ToastOptions =
        typeof options === 'string' ? { message: options } : options;
      const { message, type = 'info', duration = 3000 } = opts;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Reset animation
      opacity.setValue(0);
      translateY.setValue(-30);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -30,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      }, duration);
    },
    [opacity, translateY]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (msg) => show({ message: msg, type: 'success' }),
      error: (msg) => show({ message: msg, type: 'error', duration: 4000 }),
      info: (msg) => show({ message: msg, type: 'info' }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport opacity={opacity} translateY={translateY} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  opacity,
  translateY,
}: {
  opacity: Animated.Value;
  translateY: Animated.Value;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.viewport,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toast}>
        <Text style={styles.text}>GUILD</Text>
      </View>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  text: {
    color: theme.colors.gold,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
