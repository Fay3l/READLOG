import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/constants/themecontext';

type TimePickerFieldProps = Readonly<{
    label?: string;
    value: string;              // format "HH:MM", ex: "21:00"
    onChange: (time: string) => void;
}>;

// ── Helpers de conversion "HH:MM" <-> Date ────────────────────────────────────

function timeStringToDate(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function dateToTimeString(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ── Composant ──────────────────────────────────────────────────────────────

export function TimePickerField({ label = 'Rappel de lecture', value, onChange }: TimePickerFieldProps) {
    const styles = useStyles();
    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    function handleChange(event: DateTimePickerEvent, selected?: Date) {
        // Sur Android, le picker se ferme tout seul après sélection
        if (Platform.OS === 'android') setShowPicker(false);

        if (event.type === 'dismissed' || !selected) return;
        onChange(dateToTimeString(selected));
    }

    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>{label}</Text>

            <Pressable style={styles.trigger} onPress={() => setShowPicker(true)}>
                <Text style={styles.triggerText}>{value}</Text>
                <Text style={styles.triggerIcon}>🕘</Text>
            </Pressable>

            {/* iOS — picker inline en modal léger */}
            {showPicker && Platform.OS === 'ios' && (
                <View style={styles.iosPickerWrap}>
                    <DateTimePicker
                        value={timeStringToDate(value)}
                        mode="time"
                        display="spinner"
                        onValueChange={(event) => {
                            if (event.nativeEvent.timestamp != null) {
                                onChange(dateToTimeString(new Date(event.nativeEvent.timestamp)));
                            }
                        }}
                        textColor={theme.colors.text.primary}
                        style={styles.iosPicker}
                    />
                    <Pressable style={styles.doneBtn} onPress={() => setShowPicker(false)}>
                        <Text style={styles.doneBtnText}>Valider</Text>
                    </Pressable>
                </View>
            )}

            {/* Android — dialog natif, pas de wrapper visuel nécessaire */}
            {showPicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={timeStringToDate(value)}
                    mode="time"
                    display="clock"
                    onValueChange={(event) => {
                        setShowPicker(false);
                        if (event.nativeEvent.timestamp != null) {
                            onChange(dateToTimeString(new Date(event.nativeEvent.timestamp)));
                        }
                    }}
                />
            )}
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────

function useStyles() {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create({
        wrap: {
            gap: theme.spacing.xs,
        },
        label: {
            marginBottom:5,
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.secondary,
        },
        trigger: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.bg.input,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
        },
        triggerText: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.lg,
            color: theme.colors.text.primary,
        },
        triggerIcon: {
            fontSize: theme.fontSizes.md,
        },
        iosPickerWrap: {
            backgroundColor: theme.colors.bg.card,
            borderRadius: theme.radius.lg,
            marginTop: theme.spacing.sm,
            paddingBottom: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
        },
        iosPicker: {
            height: 180,
        },
        doneBtn: {
            alignSelf: 'center',
            backgroundColor: theme.colors.accent.default,
            borderRadius: theme.radius.full,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.xs,
            marginTop: theme.spacing.xs,
        },
        doneBtnText: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.onAccent,
        },
    }), [theme]);
}