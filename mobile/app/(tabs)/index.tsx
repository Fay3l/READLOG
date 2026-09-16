import { useMemo } from "react";
import { router } from "expo-router";
import { useTheme } from "@/constants/themecontext";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Screen } from "@/components/screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { TitlePage } from "@/components/titlepage";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 19 || hour < 6) {
    return 'Bonsoir 👋';
  }
  return 'Bonjour 👋';
}

export default function Index() {
  const styles = useIndexStyles();
  const theme = useTheme()
  const camera = () => {
    router.push('./camera')
  }
  return (
    <Screen>
      <SafeAreaView
        style={styles.container}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TitlePage subtitle={getGreeting()} title="Ma Bibliothèque" />
          <View>
            <View style={styles.icon_profile}>
              <Text style={styles.icon_profile_text}>A</Text>
            </View>
          </View>
        </View>

        <View style={styles.button}>
          <TouchableOpacity style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }} onPress={camera}>
            <Text style={styles.button_text}>Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Screen>

  );
}

function useIndexStyles() {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      gap: 15,
      margin: 15,
    },
    secondary_text: {
      fontFamily: theme.fonts.playfair.regular,
      fontSize: theme.fontSizes.lg,
      color: theme.colors.text.secondary,
      fontWeight: "bold",
    },
    button: {
      backgroundColor: theme.colors.bg.banner,
      padding: 10,
      margin: 10,
      borderRadius: theme.radius.lg,
    },
    button_text: {
      fontFamily: theme.fonts.playfair.regular,
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.secondary,
    },
    icon_profile: {
      position: 'relative',
      backgroundColor: theme.gradients.premium[0],
      borderRadius: theme.radius.full,
      minWidth: 40,
      minHeight: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    icon_profile_text: {
      fontSize: theme.fontSizes.md,
      fontWeight: "bold"
    }
  }), [theme]);
}