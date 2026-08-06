import { Theme } from "@/constants/theme";
import { router } from "expo-router";
import { StyleSheet, Text, View, Image } from "react-native";

export default function Index() {
  const camera = ()=>{
    router.push('./camera')
  }
  return (
    <View
      style={styles.container}
    >
      <Image style={{width:20, height:20}} source={require('@/assets/icon/moon.svg')} />
      <Text style={styles.secondary_text}>Hello World</Text>
      <Text style={styles.secondary_text}>Ma bibliothèque</Text>
      <View>
        <Text onPress={camera}>Camera</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secondary_text:{
    fontFamily: Theme.fonts.playfair.regular,
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.hint
  },
  button:{
    margin:5,
    fontSize:20,
    textDecorationLine:"underline",
    color: "black"
  },
})