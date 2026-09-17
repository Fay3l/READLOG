import { useMemo, useState } from "react";
import { router } from "expo-router";
import { useTheme } from "@/constants/themecontext";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Screen } from "@/components/screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { TitlePage } from "@/components/titlepage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { IconProfile } from "@/components/iconprofile";
import { StatusButton } from "@/components/statusbuttons";
import { CardBook } from "@/components/cardbook";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 19 || hour < 6) {
    return 'Bonsoir ';
  }
  return 'Bonjour ';
}

export default function Index() {
  const status = ["all", "reading", "finished", "to_read"]
  const [state, setState] = useState("all")
  const styles = useIndexStyles();
  const theme = useTheme()
  const camera = () => {
    router.push('./camera')
  }
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) return <ActivityIndicator />
  return (
    <Screen>
      <SafeAreaView
        style={styles.container}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TitlePage subtitle={getGreeting() + user?.name + ' 👋'} title="Ma Bibliothèque" />
          <View>
            <IconProfile fontSize={theme.fontSizes.md} height={40} name={user.name} shadow={false} width={40}></IconProfile>
          </View>
        </View>

        <View style={styles.button}>
          <TouchableOpacity onPress={camera}>
            <Text style={styles.button_text}>Camera</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row',gap:5 }}>
          <View>
            <TouchableOpacity style={[styles.status_button, { backgroundColor: state == "all" ? theme.colors.accent.default : theme.colors.bg.banner }]} onPress={() => setState(status[0])}>
              <Text style={styles.status_button_text}>Tous</Text>
            </TouchableOpacity>
          </View>
          <View >
            <TouchableOpacity style={[styles.status_button, { backgroundColor: state == "reading" ? theme.gradients.premium[0] : theme.colors.bg.banner }]} onPress={() => setState(status[1])}>
              <Text style={styles.status_button_text}>En cours</Text>
            </TouchableOpacity>
          </View>
          <View >
            <TouchableOpacity style={[styles.status_button, { backgroundColor: state == "finished" ? theme.gradients.premium[0] : theme.colors.bg.banner }]} onPress={() => setState(status[2])}>
              <Text style={styles.status_button_text}>Terminé</Text>
            </TouchableOpacity>
          </View>
          <View >
            <TouchableOpacity style={[styles.status_button, { backgroundColor: state == "to_read" ? theme.gradients.premium[0] : theme.colors.bg.banner }]} onPress={() => setState(status[3])}>
              <Text style={styles.status_button_text}>A lire</Text>
            </TouchableOpacity>
          </View>
        </View>
        <CardBook></CardBook>
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
      textAlign: 'center'
    },
    status_button: {
      padding: 10,
      borderRadius: theme.radius.full,
    },
    status_button_text: {
      fontFamily: theme.fonts.dmSans.medium,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.primary,
      textAlign: 'center'
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