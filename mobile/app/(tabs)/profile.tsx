import { useSession } from "@/auth/ctx";
import { useTheme } from "@/constants/themecontext";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bell from "@/assets/icon/bell.svg"
import Moon from "@/assets/icon/moon.svg"
import TargetHitAim from "@/assets/icon/target-hit-aim.svg"
import { Screen } from "@/components/screen";
import { TitlePage } from "@/components/titlepage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { IconProfile } from "@/components/iconprofile";
import { AnimateBook } from "@/components/animatebook";



export default function Profile() {
    const Theme = useTheme()
    const { signOut } = useSession();
    const { user, isLoading } = useCurrentUser();


    if (isLoading || !user) {
        return (
            <Screen >
                <SafeAreaView>
                    <AnimateBook></AnimateBook>
                </SafeAreaView>
            </Screen>
        );
    }

    return (
        <Screen>
            <SafeAreaView style={[styles.container]}>
                <TitlePage title="Profil" subtitle="Mon compte" />
                <View style={[styles.object_center, { marginBottom: 20 }]}>
                    <IconProfile fontSize={Theme.fontSizes.xl} height={70} name={user.name} shadow={true} width={70}></IconProfile>
                    <Text style={[{ color: Theme.colors.text.secondary, fontFamily: Theme.fonts.playfair.bold, fontSize: Theme.fontSizes.lg, marginTop: 10 }]}>{user.name}</Text>
                    <Text style={[{ color: Theme.colors.text.secondary, fontFamily: Theme.fonts.system.serif, fontSize: Theme.fontSizes.base }]}>{user.email}</Text>
                </View>
                <View style={{ marginBottom: 10, marginLeft: 10, gap: 10 }}>
                    <Text style={{ fontSize: Theme.fontSizes.sm, color: Theme.colors.text.muted }}>BADGES OBTENUES</Text>
                    <View style={{ backgroundColor: Theme.gradients.banner[0] }}></View>
                </View>

                <View style={[{ gap: 23, marginLeft: 10, marginTop: 10 }]}>
                    <Text style={{ fontSize: Theme.fontSizes.sm, color: Theme.colors.text.muted }}>REGLAGES</Text>
                    <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <TargetHitAim width={20} height={20} />
                        <Text style={[{ fontSize: Theme.fontSizes.sm, color: Theme.colors.text.secondary }]}>Objectif annuel</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 10, marginRight: 30 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: Theme.colors.accent.ghost }} />
                    </View>
                    <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Bell width={20} height={20} />
                        <Text style={[{ fontSize: Theme.fontSizes.sm, color: Theme.colors.text.secondary }]}>Rappel de lecture</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 10, marginRight: 30 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: Theme.colors.accent.ghost }} />
                    </View>
                    <View style={{ gap: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Moon width={20} height={20} />
                        <Text style={[{ fontSize: Theme.fontSizes.sm, color: Theme.colors.text.secondary }]}>Thème</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 10, marginRight: 30 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: Theme.colors.accent.ghost }} />
                    </View>
                </View>

                <TouchableOpacity onPress={() => { signOut() }} style={[{ paddingVertical: 20, margin: 20, borderWidth: 1, borderColor: 'red', borderRadius: Theme.radius.lg }]}>
                    <Text style={{ color: '#a66161', textAlign: 'center', fontFamily: Theme.fonts.dmSans.medium, fontWeight: "bold" }}>
                        Se déconnecter
                    </Text>
                </TouchableOpacity>

            </SafeAreaView>
        </Screen>

    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        margin: 15
    },
    object_center: {
        justifyContent: "center",
        alignItems: "center",
        gap: 7,
    },
    icon_shadow: {
        boxShadow: "0 8px 10px rgba(212,169,106,0.3)",
    }
})