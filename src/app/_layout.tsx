import { Stack } from "expo-router"
import { colors } from "@/styles/theme"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { 
    useFonts,
    Poppins_600SemiBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
} from "@expo-google-fonts/poppins"

import { Loading } from "@/components/loading"
import { StatusBar } from "react-native"

import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/contexts/authContext"

export default function Layout() {
    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_700Bold,
    })

    if (!fontsLoaded) {
        return <Loading />
    }

    return (
        <>
            <AuthProvider>
                <PaperProvider>
                    <StatusBar barStyle="light-content" backgroundColor="#FFF" />
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <Stack screenOptions={{ headerShown: false, contentStyle:  { backgroundColor: colors.green.base}}} />
                    </GestureHandlerRootView>
                </PaperProvider>
            </AuthProvider>
        </>
    )
}