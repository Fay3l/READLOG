import { useEffect, useMemo } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/themecontext';
import { useToast, registerGlobalToast } from '@/components/toast/toast_context';

// ── Icônes par type ────────────────────────────────────────────────────────

const ICONS = {
  error:   '⚠️',
  success: '✅',
  info:    'ℹ️',
};

export function Toast() {
  const theme = useTheme();
  const styles = useStyles();
  const { toast, show, hide } = useToast();

  const translateY = useSharedValue(-100);
  const opacity     = useSharedValue(0);

  // Enregistre "show" pour l'appeler depuis en dehors de React (ex: api.ts)
  useEffect(() => {
    registerGlobalToast(show);
  }, [show]);

  useEffect(() => {
    if (toast) {
      translateY.value = withSpring(0, { damping: 14 });
      opacity.value     = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value     = withTiming(0, { duration: 200 });
    }
  }, [toast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity:   opacity.value,
  }));

  if (!toast) return null;

  const colors: { bg: string; border: string; text: string } = {
    error:   { bg: '#2E1A1A', border: '#C0504A', text: '#F0C4C0' },
    success: { bg: '#1A2B1A', border: theme.colors.status.finished, text: '#D4E8D4' },
    info:    { bg: theme.colors.bg.card, border: theme.colors.accent.default, text: theme.colors.text.primary },
  }[toast.type];

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <Animated.View style={[styles.toast, animatedStyle, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Pressable style={styles.content} onPress={hide}>
          <Text style={styles.icon}>{ICONS[toast.type]}</Text>
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
            {toast.message}
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

function useStyles() {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create({
    safeArea: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 999,
      paddingHorizontal: theme.spacing.lg,
    },
    toast: {
      borderRadius:  theme.radius.md,
      borderWidth:   1,
      marginTop:     theme.spacing.sm,
      ...theme.shadows.md,
    },
    content: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical:   theme.spacing.md,
    },
    icon: {
      fontSize: theme.fontSizes.md,
    },
    message: {
      flex:       1,
      fontFamily: theme.fonts.dmSans.medium,
      fontSize:   theme.fontSizes.sm,
      lineHeight: theme.fontSizes.sm * theme.lineHeights.normal,
    },
  }), [theme]);
}