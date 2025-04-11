import { View, Image } from "react-native";
import { s } from "./styles";
import { Button } from "react-native-paper";
import { colors } from "@/styles/colors";
import { useAuth } from "@/contexts/authContext";

export function TopNavigationBar() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return(
        <View
            style={s.container}
        >
            <View
                style={s.navigationBar}
            >
                <Image
                    style={{
                        height: 50,
                        width: 80
                    }}
                    source={require("../../../assets/white-logo.png")} 
                />

                <Button
                    rippleColor={colors.whiteShades.transparent}
                    onPress={handleLogout}
                >
                    <Image
                        style={{
                            height: 40,
                            width: 40
                        }}
                        source={require("../../../assets/icons/leave.png")} 
                    />
                </Button>
            </View>
        </View>
    )
}