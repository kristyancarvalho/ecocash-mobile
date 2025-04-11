import { colors } from "@/styles/colors"
import { fontFamily } from "@/styles/font-family"
import { StyleSheet } from "react-native"

export const s = StyleSheet.create({
    buttonContainer: {
        width: "100%",
        backgroundColor: colors.green.base,
        borderRadius: 8,
        marginTop: 24
    },

    buttonTitle: {
        color: colors.whiteShades[100],
        fontFamily: fontFamily.medium,
        fontSize: 16,
    }
})