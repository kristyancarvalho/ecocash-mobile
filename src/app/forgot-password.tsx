import { colors } from "@/styles/colors"
import { fontFamily } from "@/styles/font-family"
import { IconArrowLeft, IconTool } from "@tabler/icons-react-native"
import { router } from "expo-router"
import { Text, View } from "react-native"
import { TouchableRipple } from "react-native-paper"

export default function ForgotPassword() {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "#FFF",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <IconTool size={100} color={"#000"}/>
            <View
                style={{
                    marginTop: 20,
                    alignItems: "center"
                }}
            >
                <Text
                    style={{
                        color: "#000",
                        fontSize: 24,
                        fontFamily: fontFamily.bold
                    }}
                >Em breve!</Text>
                <TouchableRipple
                    style={{
                        padding: 10
                    }}
                    onPress={() => router.push("/login")}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10
                        }}
                    >
                        <IconArrowLeft size={24} color={colors.green.base}/>
                        <Text
                            style={{
                                color: colors.green.base,
                                fontSize: 16,
                                fontFamily: fontFamily.regular,
                            }}
                        >
                            Voltar à Login
                        </Text>
                    </View>
                </TouchableRipple>
            </View>
        </View>
    )
}