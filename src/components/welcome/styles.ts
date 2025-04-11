import { colors } from "@/styles/colors"
import { fontFamily } from "@/styles/font-family"
import { StyleSheet } from "react-native"

export const s = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: 10,
    },

    title: {
        fontSize: 20,
        fontFamily: fontFamily.bold,
        color: "#000"
    },

    InfoContainer: {
        gap: 5,
        width: "100%",
    },

    info: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        fontSize: 16,
        fontFamily: fontFamily.regular,
        padding: 10,
        width: "100%",
        backgroundColor: colors.whiteShades[200],
        borderRadius: 8
    },

})