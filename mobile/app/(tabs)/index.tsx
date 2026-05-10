import { Theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.secondary_text}>Hello World</Text>
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