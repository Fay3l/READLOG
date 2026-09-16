
import { Screen } from "@/components/screen"
import { TitlePage } from "@/components/titlepage"
import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CheckMark from "@/assets/icon/check-mark.svg"

export default function About() {
  return (
    <Screen>
      <SafeAreaView style={styles.container}>
        <TitlePage title="Statistiques" subtitle="Année" />
        <View>
          <View></View>
          <View>
            <View></View>
            <View></View>
            <View></View>
            <View></View>
          </View>
          <View></View>
        </View>
      </SafeAreaView>
    </Screen>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
  },
  button: {
    margin: 5,
    fontSize: 20,
    textDecorationLine: "underline",
    color: "black"
  }
})