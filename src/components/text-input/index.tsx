import { colors, fontFamily } from "@/styles/theme"
import { StyleProp, ViewStyle } from "react-native"
import { TextInput, TextInputProps } from "react-native-paper"

interface CustomTextInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>
}

export function CustomTextInput({
  containerStyle,
  style,
  mode = "outlined",
  ...rest
}: CustomTextInputProps) {
  return (
    <TextInput
      mode={mode}
      style={[
        {
          width: "100%",
          backgroundColor: colors.whiteShades[100],
        },
        style
      ]}
      outlineStyle={{
        borderRadius: 8,
        borderColor: colors.whiteShades[300],
      }}
      contentStyle={{
        fontFamily: fontFamily.regular,
        fontSize: 16,
        color: "#000"
      }}
      placeholderTextColor="#C4C4C4"
      selectionColor={colors.green.dark}
      theme={{
        colors: {
          onSurfaceVariant: "#C4C4C4",
          primary: colors.green.base,
        },
      }}
      {...rest}
    />
  )
}