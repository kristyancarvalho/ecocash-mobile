import { colors } from "@/styles/theme"
import { StyleProp, Text, TextStyle, ViewStyle } from "react-native"
import { Button } from "react-native-paper"
import { s } from "./styles"

interface CustomButtonProps {
  title: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  rippleColor?: string
  disabled?: boolean
}

export function CustomButton({
  title,
  onPress,
  style,
  textStyle,
  rippleColor = colors.green.dark,
  disabled = false
}: CustomButtonProps) {
  return (
    <Button 
      style={[
        s.buttonContainer,
        disabled && { opacity: 0.7 },
        style
      ]} 
      onPress={onPress}
      rippleColor={rippleColor}
      disabled={disabled}
    >
      <Text
        style={[
            s.buttonTitle,
            textStyle
        ]}
      >
        {title}
      </Text>
    </Button>
  )
}