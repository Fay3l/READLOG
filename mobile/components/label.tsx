import { useTheme } from "@/constants/themecontext";
import { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, TextInputProps } from "react-native";

interface LabelProps {
  value: string;
  setValue: (text: string) => void;
  name: string;
}

// Réglages du champ selon son libellé
function inputPropsFor(name: string): Partial<TextInputProps> {
  if (name === "Mot de passe") {
    return {
      // ✅ "visible-password" (ancienne valeur) AFFICHAIT le mot de passe en clair sur Android
      secureTextEntry: true,
      autoCapitalize: "none",
      autoCorrect: false,
      autoComplete: "password",
      textContentType: "password",
    }
  }
  if (name === "E-mail") {
    return {
      keyboardType: "email-address",
      autoCapitalize: "none",
      autoCorrect: false,
      autoComplete: "email",
      textContentType: "emailAddress",
    }
  }
  return {}
}

export function Label({ value, name, setValue }: LabelProps) {
  const theme = useTheme()
  const styles = useStyles()
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const props = inputPropsFor(name)
  const isPassword = !!props.secureTextEntry

  return (
    <View>
      <Text style={styles.name}>{name}</Text>
      <View style={[styles.field, isFocused && styles.field_focus]}>
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={setValue}
          value={value}
          placeholderTextColor={theme.colors.text.hint}
          style={styles.text_input}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword(v => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <Text style={styles.toggle}>{showPassword ? "Masquer" : "Afficher"}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

function useStyles() {
  const theme = useTheme()
  return useMemo(() => StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingRight: 15,
      borderWidth: 2,
      borderRadius: 15,
      borderColor: theme.colors.border.card,
      backgroundColor: theme.colors.bg.input,
    },
    field_focus: {
      borderColor: theme.colors.border.focus,
    },
    text_input: {
      flex: 1,
      padding: 15,
      fontFamily: theme.fonts.dmSans.regular,
      fontSize: theme.fontSizes.base,
      color: theme.colors.text.primary,
    },
    toggle: {
      fontFamily: theme.fonts.dmSans.medium,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.accent.default,
    },
    name: {
      marginBottom: 10,
      fontFamily: theme.fonts.dmSans.medium,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.label
    }
  }), [theme])
}
