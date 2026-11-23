import { Screen } from "@/components/screen"
import { TitlePage } from "@/components/titlepage"
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CheckMark from "@/assets/icon/check-mark.svg"
import OpenBook from "@/assets/icon/open-book.svg"
import LabelIcon from "@/assets/icon/label.svg"
import FileText from "@/assets/icon/file-text.svg"
import { useCallback, useMemo, useState } from "react"
import { useTheme } from "@/constants/themecontext"
import { AppTheme } from "@/constants/theme"
import * as Progress from 'react-native-progress'
import { AnimateBook } from "@/components/animatebook"
import { useFocusEffect } from "expo-router"
import { get_stats } from "@/fetch/stats"
import { UserStats } from "@/types/stats"
import { MonthlyChart } from "@/components/monthlychart"
import { TAB_BAR_SPACE } from "@/constants/layout"

export default function Stats() {
  const theme = useTheme()
  const styles = useStyles(theme)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const data = await get_stats()
    if (data) setStats(data)
  }, [])

  // ✅ recharge à chaque fois qu'on revient sur l'onglet (un livre a pu être terminé entre-temps)
  useFocusEffect(useCallback(() => { void load() }, [load]))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (!stats) {
    return (
      <Screen>
        <SafeAreaView>
          <AnimateBook />
        </SafeAreaView>
      </Screen>
    )
  }

  const goal = Math.max(stats.reading_goal, 1)
  const done = stats.finished_this_year
  const progress = Math.min(done / goal, 1)
  const remaining = Math.max(goal - done, 0)
  const isCurrentYear = stats.year === new Date().getFullYear()

  return (
    <Screen>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          // ✅ la tab bar flotte au-dessus du contenu : on réserve sa place en bas
          contentContainerStyle={{ gap: 14, paddingBottom: TAB_BAR_SPACE }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent.default} />}
        >
          <TitlePage title="Statistiques" subtitle={`Année ${stats.year}`} />

          {/* ── Objectif annuel ── */}
          <View style={styles.card}>
            <View style={styles.goal_row}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.overline}>Objectif annuel</Text>
                <Text style={styles.goal_text}>
                  <Text style={styles.big_number}>{done}</Text>
                  <Text style={styles.muted}> / {stats.reading_goal} livres</Text>
                </Text>
                <Text style={styles.hint}>
                  {remaining === 0
                    ? "Objectif atteint, bravo !"
                    : `Plus que ${remaining} livre${remaining > 1 ? "s" : ""} pour y arriver`}
                </Text>
              </View>
              <Progress.Circle
                size={84}
                thickness={7}
                progress={progress}
                borderWidth={0}
                unfilledColor={theme.colors.border.progress}
                color={theme.colors.accent.default}
                showsText
                formatText={() => `${Math.round(progress * 100)}%`}
                textStyle={styles.ring_text}
                strokeCap="round"
              />
            </View>
          </View>

          {/* ── Compteurs ── */}
          <View style={styles.grid}>
            <StatTile theme={theme} icon={<CheckMark width={22} height={22} />} value={stats.finished_books} label="Lus" />
            <StatTile theme={theme} icon={<OpenBook width={22} height={22} />} value={stats.reading_books} label="En cours" />
          </View>
          <View style={styles.grid}>
            <StatTile theme={theme} icon={<LabelIcon width={22} height={22} />} value={stats.to_read_books} label="À lire" />
            <StatTile theme={theme} icon={<FileText width={22} height={22} />} value={stats.pages_read.toLocaleString('fr-FR')} label="Pages lues" />
          </View>

          {/* ── Livres terminés par mois ── */}
          <View style={styles.card}>
            <Text style={[styles.overline, { marginBottom: 4 }]}>Livres lus par mois</Text>
            <MonthlyChart
              values={stats.books_per_month}
              currentMonth={isCurrentYear ? new Date().getMonth() : null}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  )
}

function StatTile({ theme, icon, value, label }: { theme: AppTheme; icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.bg.card,
      borderWidth: 1,
      borderColor: theme.colors.border.card,
      borderRadius: theme.radius.lg,
      padding: 16,
      gap: 10,
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: theme.radius.md,
        backgroundColor: theme.colors.accent.ghost,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </View>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: theme.fonts.playfair.bold, fontSize: theme.fontSizes.xl, color: theme.colors.text.primary }}>{value}</Text>
        <Text style={{ fontFamily: theme.fonts.dmSans.regular, fontSize: theme.fontSizes.sm, color: theme.colors.text.label }}>{label}</Text>
      </View>
    </View>
  )
}

function useStyles(theme: AppTheme) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: 20,
      marginTop: 15,
    },
    card: {
      backgroundColor: theme.colors.bg.card,
      borderWidth: 1,
      borderColor: theme.colors.border.card,
      borderRadius: theme.radius.lg,
      padding: 18,
    },
    goal_row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    overline: {
      fontFamily: theme.fonts.dmSans.medium,
      fontSize: theme.fontSizes.xs,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: theme.colors.text.label,
    },
    goal_text: {
      color: theme.colors.text.primary,
    },
    big_number: {
      fontFamily: theme.fonts.playfair.bold,
      fontSize: theme.fontSizes['3xl'],
      color: theme.colors.text.primary,
    },
    muted: {
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.base,
      color: theme.colors.text.secondary,
    },
    hint: {
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.label,
    },
    ring_text: {
      fontFamily: theme.fonts.dmSans.medium,
      fontSize: theme.fontSizes.base,
      color: theme.colors.text.primary,
    },
    grid: {
      flexDirection: 'row',
      gap: 14,
    },
  }), [theme])
}
