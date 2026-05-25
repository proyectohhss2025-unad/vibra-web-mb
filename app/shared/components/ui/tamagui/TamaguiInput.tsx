/**
 * TamaguiInput — Input de texto estilizado con Tamagui
 *
 * Wrapper compatible con TextInput de React Native para migración progresiva.
 *
 * @see https://tamagui.dev/ui/input
 */
import React from 'react'
import { type TextInputProps as RNTextInputProps, type ViewStyle } from 'react-native'
import { Input } from 'tamagui'

type TamaguiInputProps = {
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  secureTextEntry?: boolean
  keyboardType?: RNTextInputProps['keyboardType']
  autoCapitalize?: RNTextInputProps['autoCapitalize']
  style?: ViewStyle | ViewStyle[]
  error?: boolean
  multiline?: boolean
  numberOfLines?: number
  disabled?: boolean
  placeholderTextColor?: string
}

/**
 * Aplana un estilo que puede ser array u objeto.
 * Necesario porque Tamagui en web no soporta arrays de estilo.
 */
function flattenStyle(style: ViewStyle | ViewStyle[] | undefined): ViewStyle | undefined {
  if (!style) return undefined
  if (Array.isArray(style)) {
    return Object.assign({}, ...style) as ViewStyle
  }
  return style
}

const TamaguiInput: React.FC<TamaguiInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  style,
  error,
  multiline,
  numberOfLines,
  disabled,
  placeholderTextColor,
}) => {
  const flatStyle = flattenStyle(style)
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      numberOfLines={numberOfLines}
      disabled={disabled}
      borderWidth={1}
      borderRadius={12}
      borderColor={error ? '#FF0000' : 'rgba(255,255,255,0.2)'}
      backgroundColor="rgba(255,255,255,0.1)"
      color="white"
      padding={16}
      fontSize={16}
      {...(flatStyle ? { style: flatStyle } : {})}
      {...(placeholderTextColor ? { placeholderTextColor: placeholderTextColor as any } : {})}
    />
  )
}

export default TamaguiInput
