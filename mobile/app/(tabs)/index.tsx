import { useIndexStyles } from "@/hooks/useIndexStyles";

import { router } from "expo-router";
import { StyleSheet, Text, View, Image,  TouchableOpacity } from "react-native";

export default function Index() {
  const styles = useIndexStyles();
  const camera = ()=>{
    router.push('./camera')
  }
  return (
    <View
      style={styles.container}
    >

      <Text style={styles.secondary_text}>Hello World</Text>
      <Text style={styles.secondary_text}>Ma bibliothèque</Text>
      <View style={styles.button}>
        <TouchableOpacity style={{flexDirection:"row",justifyContent:'center',alignItems:'center'}} onPress={camera}>
          <Text style={styles.button_text}>Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
