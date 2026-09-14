import { useSession } from "@/auth/ctx";
import { useTheme } from "@/constants/themecontext";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bell from "@/assets/icon/bell.svg"
import Moon from "@/assets/icon/moon.svg"
import TargetHitAim from "@/assets/icon/target-hit-aim.svg"



export default function Profile() {
    const Theme = useTheme()
    const {signOut} = useSession();

    return (<SafeAreaView style={[styles.container, { backgroundColor: Theme.colors.bg.primary }]}>
        <Text style={[ { marginTop: 20, marginLeft: 20, fontSize: Theme.fontSizes.base }]}>Mon compte</Text>
        <Text style={[{ color: "white", fontFamily: Theme.fonts.playfair.bold, marginTop: 10, marginLeft: 20,marginBottom:20, fontSize: Theme.fontSizes["3xl"] }]}>Profil</Text>
        <View style={[styles.object_center,{marginBottom:20}]}>
            <View style={[styles.icon_shadow,{backgroundColor:Theme.gradients.premium[0],borderRadius:Theme.radius.full,minWidth:70,minHeight:70},styles.object_center]}>
                <Text style={[{fontSize:Theme.fontSizes.xl, fontWeight:"bold"}]}>A</Text>
            </View>
            <Text style={[{ color: "white", fontFamily: Theme.fonts.playfair.bold, fontSize: Theme.fontSizes.lg, marginTop:10 }]}>Alice</Text>
            <Text style={[{ color: Theme.colors.text.secondary, fontFamily: Theme.fonts.system.serif, fontSize: Theme.fontSizes.base }]}>alice@readlog.app</Text>
        </View>
        <View style={{marginBottom:10,marginLeft:10,gap:10}}>
            <Text style={{fontSize:Theme.fontSizes.md,color:Theme.colors.text.muted}}>BADGES OBTENUES</Text>
            <View style={{backgroundColor:Theme.gradients.banner[0]}}></View>
        </View>
        
        <View style={[{gap:20,marginLeft:10,marginTop:10}]}>
            <Text style={{fontSize:Theme.fontSizes.md,color:Theme.colors.text.muted}}>REGLAGES</Text>
            <Text style={[{fontSize:Theme.fontSizes.md,color:Theme.colors.text.secondary}]}><TargetHitAim width={20} height={20}/> Objectif annuel</Text>
            <Text style={[{fontSize:Theme.fontSizes.md,color:Theme.colors.text.secondary}]}><Bell width={20} height={20}/> Rappel de lecture</Text>
            <Text style={[{fontSize:Theme.fontSizes.md,color:Theme.colors.text.secondary}]}><Moon width={20} height={20}/> Thème </Text> 
        </View>

        <View style={[{padding:15, margin:20,borderWidth:0.3,borderColor:'red',borderRadius:Theme.radius.lg},styles.object_center]}>
            <Text style={{color:'#a66161'}}
            onPress={()=> {signOut()}}
            >Se déconnecter</Text>
        </View>
        


    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    
    container: {
        flex: 1,
    },
    object_center: {
        justifyContent: "center",
        alignItems: "center",
        gap:7,
    },
    icon_shadow:{
        boxShadow: "0 8px 24px rgba(212,169,106,0.7)",
    }
})