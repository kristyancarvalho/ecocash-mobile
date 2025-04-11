import { Welcome } from "@/components/welcome"
import { CustomButton } from "../components/button"
import { router } from "expo-router"
import { View } from "react-native"

export default function Index() {
    return (
        <>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    paddingHorizontal: 20,
                    backgroundColor: "#FFF"
                }}
            >
                <Welcome />
                <CustomButton 
                  title="Começar" 
                  onPress={() => router.push("/login")}
                />
            </View>
        </>
    )
}