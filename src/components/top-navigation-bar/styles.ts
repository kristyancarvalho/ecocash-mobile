import { colors } from "@/styles/colors"
import { StyleSheet } from "react-native"

export const s = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        width: "100%",
    },

    navigationBar: {
        width: "100%",
        flexDirection: "row",
        backgroundColor: colors.green.base,
        alignItems:  "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 20
    }
})