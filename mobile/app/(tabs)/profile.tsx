import { Theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    return (<SafeAreaView style={styles.container}>
        <Text style={[styles.secondary_text, { marginTop: 20, marginLeft: 20, fontSize: Theme.fontSizes.base }]}>Mon compte</Text>
        <Text style={[{ color: "white", fontFamily: Theme.fonts.playfair.bold, marginTop: 10, marginLeft: 20,marginBottom:20, fontSize: Theme.fontSizes["3xl"] }]}>Profil</Text>
        <View style={styles.object_center}>
            <View style={[styles.icon_shadow,{backgroundColor:Theme.gradients.premium[0],borderRadius:Theme.radius.full,minWidth:70,minHeight:70},styles.object_center]}>
                <Text style={[{fontSize:Theme.fontSizes.xl, fontWeight:"bold"}]}>A</Text>
            </View>
            <Text style={[{ color: "white", fontFamily: Theme.fonts.playfair.bold, fontSize: Theme.fontSizes.lg, marginTop:10 }]}>Alice</Text>
            <Text style={[{ color: Theme.colors.text.secondary, fontFamily: Theme.fonts.system.serif, fontSize: Theme.fontSizes.base }]}>alice@readlog.app</Text>
        </View>


    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.bg.primary
    },
    primary_text: {
        color: Theme.colors.text.primary,
        fontFamily: Theme.fonts.playfair.regular,
    },
    secondary_text: {
        color: Theme.colors.text.secondary,
        fontFamily: Theme.fonts.playfair.regular,
    },
    object_center: {
        justifyContent: "center",
        alignItems: "center",
        gap:7,
    },
    icon_shadow:{
        boxShadow: "0 8px 24px rgba(212,169,106,0.25)",
    }
})