import { useTheme } from "@/constants/themecontext";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";


export function TagStatus(){
    const styles = useStyles()
    return(
        <View style={styles.tag}>
            <Text style={styles.text}>Terminé</Text>
        </View>
    )
}

function useStyles(){
    const theme = useTheme()
    return useMemo(()=>StyleSheet.create({
        tag:{
            backgroundColor:theme.colors.status.finishedBg,
            padding:5,
            borderRadius:theme.radius.full,
            justifyContent:'center',
            alignItems:'center'
        },
        text:{
            textAlign:'center',
            fontFamily:theme.fonts.dmSans.regular,
            color:theme.colors.status.finished,
            fontSize:theme.fontSizes.xs
        }
    }),[theme])
}