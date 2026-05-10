import { Text,StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Theme } from "@/constants/theme";

const EmojiText = ({name}: {name:string}) => {
    return <Text style={styles.tabBarIcon}>{name}</Text>
}

const TabBarLabel = ({ name, focused }: { name: string; focused: boolean } ) => {
    return <Text style={focused ? styles.tabBarLabelActive : styles.tabBarLabel}>{name}</Text>
}

export default function TabsLayout() {
    return <Tabs screenOptions={{
        tabBarActiveTintColor: "#e3a54a",
        
    }}>
        <Tabs.Screen name="index" options={{
            headerShown: false,
            tabBarIcon: () => <EmojiText name="📚"></EmojiText>,
            tabBarLabel: ({focused})=> <TabBarLabel focused={focused} name="Bibliothèque" ></TabBarLabel>
        }}></Tabs.Screen>
        <Tabs.Screen name="about" options={{
            headerShown: false,
            tabBarIcon: () => <EmojiText name="📊"></EmojiText>,
            tabBarLabel: ({focused})=> <TabBarLabel focused={focused} name="Statistiques" ></TabBarLabel>
        }}></Tabs.Screen>
        <Tabs.Screen name="profile" options={{
            headerShown: false,
            tabBarIcon: () => <EmojiText name="👤"></EmojiText>,
            tabBarLabel: ({focused})=> <TabBarLabel focused={focused} name="Profil" ></TabBarLabel>
        }}></Tabs.Screen>
    </Tabs>;
}

const styles = StyleSheet.create({
    tabBarIcon:{
        fontSize:Theme.fontSizes.md
    },
    tabBarLabel:{
        color:Theme.colors.text.secondary,
        fontFamily:Theme.fonts.playfair.regular,
    },
    tabBarLabelActive:{
        color:"#e3a54a",
        fontFamily:Theme.fonts.playfair.regular,
    }
})