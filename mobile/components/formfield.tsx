import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "@/constants/themecontext";

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
    readonly label: string
    readonly required?: boolean
    readonly hint?: string
}

// Champ de formulaire générique : libellé + saisie + aide optionnelle.
// Toutes les props de TextInput (keyboardType, multiline...) sont transmises telles quelles.
export function FormField({ label, required, hint, multiline, ...inputProps }: FormFieldProps) {
    const theme = useTheme()
    const [focused, setFocused] = useState(false)
    const styles = useMemo(() => StyleSheet.create({
        label: {
            marginBottom: 8,
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.label,
        },
        required: { color: theme.colors.accent.default },
        input: {
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1.5,
            borderRadius: theme.radius.md,
            borderColor: theme.colors.border.card,
            backgroundColor: theme.colors.bg.input,
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.primary,
        },
        multiline: { minHeight: 110, textAlignVertical: 'top' },
        focused: { borderColor: theme.colors.border.focus },
        hint: {
            marginTop: 6,
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.text.hint,
        },
    }), [theme])

    return (
        <View>
            <Text style={styles.label}>
                {label}{required ? <Text style={styles.required}> *</Text> : null}
            </Text>
            <TextInput
                {...inputProps}
                multiline={multiline}
                placeholderTextColor={theme.colors.text.hint}
                onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e) }}
                onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e) }}
                style={[styles.input, multiline && styles.multiline, focused && styles.focused]}
                accessibilityLabel={label}
            />
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    )
}
