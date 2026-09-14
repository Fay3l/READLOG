import { Text, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useLayoutStyles } from "@/hooks/useLayoutStyles";
import Books from "@/assets/icon/books.svg"
import BarChart from "@/assets/icon/bar-chart.svg"
import User from "@/assets/icon/user.svg"



export default function TabsLayout() {
    const styles = useLayoutStyles()

    const EmojiText = ({ name }: { name: string }) => {
        return <Text style={styles.tabBarIcon}>{name}</Text>
    }

    const TabBarLabel = ({ name, focused }: { name: string; focused: boolean }) => {
        return <Text style={focused ? styles.tabBarLabelActive : styles.tabBarLabel}>{name}</Text>
    }
    
    return <Tabs screenOptions={{
        tabBarActiveTintColor: "#e3a54a",
        tabBarStyle: styles.tabBarStyle

    }}>
        <Tabs.Screen name="index" options={{
            headerShown: false,
            tabBarIcon: () => <Books width={23} height={23}/>,
            tabBarLabel: ({ focused }) => <TabBarLabel focused={focused} name="Bibliothèque" ></TabBarLabel>
        }}></Tabs.Screen>
        <Tabs.Screen name="about" options={{
            headerShown: false,
            tabBarIcon: () => <BarChart width={23} height={23}/>,
            tabBarLabel: ({ focused }) => <TabBarLabel focused={focused} name="Statistiques" ></TabBarLabel>
        }}></Tabs.Screen>
        <Tabs.Screen name="profile" options={{
            headerShown: false,
            tabBarIcon: () => <User width={23} height={23}/>,
            tabBarLabel: ({ focused }) => <TabBarLabel focused={focused} name="Profil" ></TabBarLabel>
        }}></Tabs.Screen>
    </Tabs>;
}

