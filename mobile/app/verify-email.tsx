import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/constants/themecontext';
import { useToast } from '@/components/toast/toast_context';
import { Screen } from '@/components/screen';
import api from '@/lib/api';
import { StepDots } from '@/components/stepdots';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30; // secondes

export default function VerifyEmail() {
  const theme  = useTheme();          // hooks tous en haut
  const styles = useStyles();
  const { show } = useToast();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [digits, setDigits]   = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  // ── Décompte du cooldown de renvoi ──────────────────────────────────────
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ── Vérifie automatiquement dès que les 6 chiffres sont saisis ─────────
  useEffect(() => {
    if (isComplete) handleVerify();
  }, [code]);

  // ── Handlers de saisie ───────────────────────────────────────────────────
  function handleChangeDigit(text: string, index: number) {
    const clean = text.replace(/[^0-9]/g, '');
    if (!clean) return;

    // Gère le collage d'un code complet
    if (clean.length > 1) {
      const pasted = clean.slice(0, CODE_LENGTH).split('');
      setDigits((prev) => prev.map((d, i) => pasted[i] ?? d));
      inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    setError('');
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });

    if (index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyPress(e: NativeSyntheticEvent<{ key: string }>, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  }

  // ── Appels API ────────────────────────────────────────────────────────────
  async function handleVerify() {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/verify-email', { email, code });
      show('Email vérifié 🎉', 'success');
      router.replace('/goals');
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Code incorrect');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    try {
      await api.post('/api/resend-code', { email });
      show('Un nouveau code a été envoyé', 'info');
      setCooldown(RESEND_COOLDOWN);
    } catch {
      show("Impossible d'envoyer le code, réessaie", 'error');
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          <StepDots current={1} total={3}></StepDots>

          {/* En-tête */}
          <View style={styles.header}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>✉️</Text>
            </View>
            <Text style={styles.title}>Vérifie ton email</Text>
            <Text style={styles.subtitle}>
              On a envoyé un code à 6 chiffres à{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          {/* Boîtes OTP */}
          <View style={styles.otpRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                value={digit}
                onChangeText={(text) => handleChangeDigit(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? CODE_LENGTH : 1} // premier champ accepte le collage complet
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading && <Text style={styles.loadingText}>Vérification...</Text>}

          {/* Renvoi du code */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Pas reçu de code ? </Text>
            <Pressable onPress={handleResend} disabled={cooldown > 0}>
              <Text style={[styles.resendLink, cooldown > 0 && styles.resendLinkDisabled]}>
                {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Renvoyer'}
              </Text>
            </Pressable>
          </View>

          {/* Changer d'adresse email */}
          <Pressable style={styles.changeEmailBtn} onPress={() => router.back()}>
            <Text style={styles.changeEmailText}>Utiliser une autre adresse</Text>
          </Pressable>

        </SafeAreaView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function useStyles() {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing['3xl'],
      alignItems: 'center',
    },

    // Header
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    emojiCircle: {
      width: 64,
      height: 64,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.accent.tint,
      borderWidth: 1,
      borderColor: theme.colors.accent.ghost,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    emoji: { fontSize: 28 },
    title: {
      fontFamily: theme.fonts.playfair.bold,
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.label,
      textAlign: 'center',
      lineHeight: theme.fontSizes.sm * theme.lineHeights.normal,
    },
    email: {
      fontFamily: theme.fonts.dmSans.medium,
      color: theme.colors.accent.default,
    },

    // OTP boxes
    otpRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    otpBox: {
      width: 44,
      height: 54,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border.card,
      backgroundColor: theme.colors.bg.input,
      textAlign: 'center',
      fontFamily: theme.fonts.dmSans.medium,
      fontSize: theme.fontSizes.lg,
      color: theme.colors.text.primary,
    },
    otpBoxFilled: {
      borderColor: theme.colors.accent.default,
      backgroundColor: theme.colors.accent.ghost,
    },
    otpBoxError: {
      borderColor: '#C0504A',
    },

    errorText: {
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.xs,
      color: '#C0504A',
      marginBottom: theme.spacing.sm,
    },
    loadingText: {
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.hint,
      marginBottom: theme.spacing.sm,
    },

    // Resend
    resendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    resendLabel: {
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.label,
    },
    resendLink: {
      fontFamily: theme.fonts.dmSans.medium,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.accent.default,
    },
    resendLinkDisabled: {
      color: theme.colors.text.hint,
    },

    // Changer d'email
    changeEmailBtn: {
      marginTop: theme.spacing['2xl'],
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border.inactive,
    },
    changeEmailText: {
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.hint,
    },
  }), [theme]);
}