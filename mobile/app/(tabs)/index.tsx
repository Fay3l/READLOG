import { useMemo } from "react";
import { router } from "expo-router";
import { useTheme } from "@/constants/themecontext";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

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

function useIndexStyles() {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      gap:5,
      alignItems: "center",
      backgroundColor: theme.colors.bg.primary,
    },
    secondary_text: {
      fontFamily: theme.fonts.playfair.regular,
      fontSize: theme.fontSizes.lg,
      color: theme.colors.text.secondary,
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
    }
  }), [theme]);
}