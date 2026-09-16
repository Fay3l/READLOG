
import { Screen } from "@/components/screen"
import { TitlePage } from "@/components/titlepage"
import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CheckMark from "@/assets/icon/check-mark.svg"
import OpenBook from "@/assets/icon/open-book.svg"
import Label from "@/assets/icon/label.svg"
import FileText from "@/assets/icon/file-text.svg"
import { useMemo } from "react"
import { useTheme } from "@/constants/themecontext"
import * as Progress from 'react-native-progress'

export default function About() {
  const styles = useStyles()
  const theme = useTheme()
  return (
    <Screen>
      <SafeAreaView style={styles.container}>
        <TitlePage title="Statistiques" subtitle="Année" />
        <View style={{ flex: 1, marginTop: 10, marginBottom: 55, gap: 10, alignItems: 'stretch', justifyContent: 'space-evenly' }}>
          <View style={styles.card}>
            <View style={{ marginLeft: 15, marginRight: 15, gap: 20,alignItems:'stretch' }}>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <View style={{flexDirection:'column',justifyContent:'space-between'}}>
                  <Text style={styles.text_hint}>Objectif annuel</Text>
                  <Text style={styles.text_muted}><Text style={styles.number_text}>2</Text> / 12 livres</Text>
                </View>
                <Progress.Circle borderWidth={2} progress={0.17} indeterminate={false} color={theme.gradients.progressBar[0]}/>
              </View>
              <View style={{gap:10}} >
                <Progress.Bar width={null} progress={0.17} color={theme.gradients.progressBar[0]} />
                <Text style={styles.text_muted}>10 livres restants pour atteindre l'objectif</Text>
              </View>
              
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.card}>
                <View style={{ marginLeft: 15, gap: 2 }}>
                  <CheckMark width={25} height={25} />
                  <Text style={styles.number_text}>2</Text>
                  <Text style={styles.text_muted}>Lus</Text>
                </View>

              </View>
              <View style={styles.card}>
                <View style={{ marginLeft: 15, gap: 2 }}>
                  <OpenBook width={25} height={25} />
                  <Text style={styles.number_text}>2</Text>
                  <Text style={styles.text_muted}>En cours</Text>
                </View>

              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.card}>
                <View style={{ marginLeft: 15, gap: 2 }}>
                  <Label width={25} height={25} />
                  <Text style={styles.number_text}>2</Text>
                  <Text style={styles.text_muted}>À lire</Text>
                </View>

              </View>
              <View style={styles.card}>
                <View style={{ marginLeft: 15, gap: 2 }}>
                  <FileText width={25} height={25} />
                  <Text style={styles.number_text}>2</Text>
                  <Text style={styles.text_muted}>Pages</Text>
                </View>

              </View>
            </View>
          </View>
          <View style={styles.card}>
            <View style={{ marginLeft: 15, gap: 2 }}>
              <Text style={styles.text_hint}>Livres lus par mois</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Screen>

  )
}

function useStyles() {
  const theme = useTheme()
  return useMemo(() => StyleSheet.create({
    card: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border.separator,
      backgroundColor: theme.colors.border.card,
      paddingVertical: 25,
      alignItems: "stretch",
      borderRadius: 15,
    },
    container: {
      flex: 1,
      margin: 15,
    },
    button: {
      margin: 5,
      fontSize: 20,
      textDecorationLine: "underline",
      color: "black"
    },
    text_muted: {
      color: theme.colors.text.muted,
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.dmSans.medium
    },
    number_text: {
      fontFamily: theme.fonts.playfair.bold,
      fontSize: theme.fontSizes["2xl"],
      color: theme.colors.text.secondary,
    },
    text_hint:{
      color: theme.colors.text.hint,
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.dmSans.medium
    }
  }), [theme])
}