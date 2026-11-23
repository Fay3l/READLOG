import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";

const MONTHS_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
const MONTHS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
const CHART_HEIGHT = 120

interface MonthlyChartProps {
    readonly values: number[]       // 12 valeurs, janvier → décembre
    readonly currentMonth: number | null // 0-11 si l'année affichée est l'année en cours
}

// Histogramme en barres simples (pas de librairie) : une seule série, une seule couleur.
// Appuyer sur une barre affiche le détail du mois au-dessus du graphique.
export function MonthlyChart({ values, currentMonth }: MonthlyChartProps) {
    const theme = useTheme()
    const styles = useStyles(theme)
    const [selected, setSelected] = useState<number | null>(currentMonth)
    const max = Math.max(1, ...values)
    const total = values.reduce((a, b) => a + b, 0)

    const detail = selected === null
        ? `${total} livre${total > 1 ? "s" : ""} terminé${total > 1 ? "s" : ""} cette année`
        : `${values[selected]} livre${values[selected] > 1 ? "s" : ""} en ${MONTHS_LONG[selected]}`

    return (
        <View>
            <Text style={styles.detail}>{detail}</Text>

            <View style={styles.plot}>
                {/* ligne de base discrète */}
                <View style={styles.baseline} />
                {values.map((v, i) => {
                    const isSelected = selected === i
                    const height = v === 0 ? 0 : Math.max(6, (v / max) * CHART_HEIGHT)
                    return (
                        <Pressable
                            key={i}
                            style={styles.column}
                            onPress={() => setSelected(isSelected ? null : i)}
                            accessibilityRole="button"
                            accessibilityLabel={`${MONTHS_LONG[i]} : ${v} livre${v > 1 ? "s" : ""}`}
                        >
                            {/* valeur seulement pour les mois non vides : pas de "0" partout */}
                            {v > 0 ? <Text style={[styles.value, isSelected && styles.value_selected]}>{v}</Text> : null}
                            <View style={[
                                styles.bar,
                                { height, opacity: selected === null || isSelected ? 1 : 0.45 },
                            ]} />
                        </Pressable>
                    )
                })}
            </View>

            <View style={styles.labels}>
                {MONTHS_SHORT.map((m, i) => (
                    <Text key={i} style={[styles.month, i === currentMonth && styles.month_current]}>{m}</Text>
                ))}
            </View>
        </View>
    )
}

function useStyles(theme: AppTheme) {
        return useMemo(() => StyleSheet.create({
            detail: {
                fontFamily: theme.fonts.dmSans.medium,
                fontSize: theme.fontSizes.sm,
                color: theme.colors.text.secondary,
                marginBottom: 16,
            },
            plot: {
                height: CHART_HEIGHT + 20,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 2, // 2px d'espace entre les barres
            },
            baseline: {
                position: 'absolute',
                left: 0, right: 0, bottom: 0,
                height: 1,
                backgroundColor: theme.colors.border.inactive,
            },
            column: {
                flex: 1,
                height: '100%',
                justifyContent: 'flex-end',
                alignItems: 'center',
            },
            bar: {
                width: '62%',
                backgroundColor: theme.colors.accent.default,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
            },
            value: {
                fontFamily: theme.fonts.dmSans.regular,
                fontSize: theme.fontSizes.xs,
                color: theme.colors.text.label,
                marginBottom: 4,
            },
            value_selected: {
                fontFamily: theme.fonts.dmSans.medium,
                color: theme.colors.text.primary,
            },
            labels: {
                flexDirection: 'row',
                gap: 2,
                marginTop: 8,
            },
            month: {
                flex: 1,
                textAlign: 'center',
                fontFamily: theme.fonts.dmSans.regular,
                fontSize: theme.fontSizes.xs,
                color: theme.colors.text.hint,
            },
            month_current: {
                fontFamily: theme.fonts.dmSans.medium,
                color: theme.colors.accent.default,
            },
        }), [theme])
}
