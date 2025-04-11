import { Text, View, Image} from "react-native";
import { IconCircleDashedNumber1, IconCircleDashedNumber2 } from "@tabler/icons-react-native";
import { colors } from "@/styles/colors";
import { s } from "./styles"

export function Welcome() {
    const iconSize = 24

    return (
        <View style={s.container}>
            <Image source={require("../../../assets/logo.png")} />
            
            <Text style={s.title}>Bem vindo ao EcoCash!</Text>

            <View style={s.InfoContainer}>
                <View style={s.info}>
                    <IconCircleDashedNumber1 size={iconSize} color={colors.green.base}/>
                    <Text>
                        Recicle e ganhe pontos.
                    </Text>
                </View>

                <View style={s.info}>
                    <IconCircleDashedNumber2 size={iconSize} color={colors.green.base}/>
                    <Text>
                        Troque pontos por itens.
                    </Text>
                </View>
            </View>
        </View>
    )
}