
import { View,Text,StyleSheet } from "react-native"

export default function About() {
    return (
        <View style={styles.container}>
            <Text>About</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button:{
    margin:5,
    fontSize:20,
    textDecorationLine:"underline",
    color: "black"
  }
})