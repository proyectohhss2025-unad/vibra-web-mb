/**
 * TamaguiButton — Botón con sistema de variantes usando Tamagui
 *
 * Wrapper compatible con la API de CustomButton.
 * - Modo standard: usa Tamagui Button con icon prop.
 * - Modo iconTop: layout personalizado con YStack (icono arriba, texto abajo).
 * - Los estilos externos se aplican sin pisar la altura base del botón.
 */
import React, { useCallback } from 'react'
import { Pressable, type ViewStyle } from 'react-native'
import { Button, Text, YStack, styled } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'

// ─── Paleta de colores Vibra ────────────────────────────────────────────
type ColorEntry = { base: string; light: string; dark: string }
const colorMap: Record<string, ColorEntry> = {
  blue:   { base: '#0066FF', light: '#3399FF', dark: '#0052CC' },
  red:    { base: '#FF0000', light: '#FF4444', dark: '#CC0000' },
  green:  { base: '#00CC00', light: '#33DD33', dark: '#00A300' },
  purple: { base: '#6600CC', light: '#8833DD', dark: '#5200A3' },
  orange: { base: '#FF6600', light: '#FF8833', dark: '#CC5200' },
  yellow: { base: '#FFCC00', light: '#FFD633', dark: '#CCA300' },
  gray:   { base: '#666666', light: '#888888', dark: '#4D4D4D' },
}

type TamaguiButtonProps = {
  title: string
  variantColor?: string
  onPress: () => void
  style?: ViewStyle | ViewStyle[]
  neonEffect?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  iconSize?: number
  disabled?: boolean
  buttonType?: 'standard' | 'iconTop'
  fullWidth?: boolean
}

/** Convierte un estilo array en objeto plano */
function flatten(style: ViewStyle | ViewStyle[] | undefined): ViewStyle | undefined {
  if (!style) return undefined
  if (Array.isArray(style)) return Object.assign({}, ...style) as ViewStyle
  return style
}

// ─── Componente base para iconTop (Touchable con forma de botón) ────────
const IconTopWrap = styled(YStack, {
  name: 'IconTopWrap',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 12,
})

const TamaguiButton: React.FC<TamaguiButtonProps> = ({
  title,
  variantColor = 'blue',
  onPress,
  style = {},
  neonEffect = false,
  icon,
  iconPosition = 'left',
  iconSize = 24,
  disabled = false,
  buttonType = 'standard',
  fullWidth = false,
}) => {
  const c = colorMap[variantColor] || colorMap.blue
  const flatStyle = flatten(style as any)

  // Extraer altura del style externo para no perderla, pero aplicar mínimo
  const externalHeight = flatStyle?.height
  const mergedStyle = flatStyle
    ? { ...flatStyle } // copia sin mutar original
    : undefined
  // No pasar height por style, lo manejamos con la prop height abajo

  const handlePress = useCallback(() => {
    if (!disabled) onPress()
  }, [disabled, onPress])

  // Elemento icono
  const iconElement = icon ? (
    <MaterialIcons
      name={icon}
      size={buttonType === 'iconTop' ? iconSize * 1.5 : iconSize}
      color="white"
    />
  ) : undefined

  // ─── Modo iconTop: icono arriba + texto abajo ─────────────────────
  if (buttonType === 'iconTop') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? c.dark : c.base,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            height: externalHeight || 85,
            minHeight: 80,
            paddingVertical: 10,
            paddingHorizontal: 12,
            opacity: disabled ? 0.5 : 1,
            // Sombra
            elevation: 4,
            shadowColor: c.base,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            // Full width
            ...(fullWidth ? { flex: 1 } : {}),
          },
          mergedStyle,
        ]}
      >
        {iconElement}
        <YStack marginTop={icon ? 6 : 0} alignItems="center">
          <Text
            color="white"
            fontWeight="bold"
            fontSize={13}
            textAlign="center"
            numberOfLines={2}
          >
            {title}
          </Text>
        </YStack>
      </Pressable>
    )
  }

  // ─── Modo standard: icono al lado + texto ─────────────────────────
  return (
    <Button
      backgroundColor={c.base}
      borderWidth={0}
      borderRadius={10}
      color="white"
      fontWeight="bold"
      fontSize={16}
      height={externalHeight || 50}
      minHeight={48}
      paddingHorizontal={20}
      paddingVertical={12}
      opacity={disabled ? 0.5 : 1}
      // Icono
      icon={iconPosition === 'left' && iconElement ? iconElement : undefined}
      iconAfter={iconPosition === 'right' && iconElement ? iconElement : undefined}
      // Sombra
      elevation={4}
      shadowColor={c.base}
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.3}
      shadowRadius={4}
      // Estados
      pressStyle={{
        backgroundColor: c.dark,
        opacity: 0.9,
      } as any}
      disabledStyle={{ opacity: 0.5 } as any}
      // Layout extra
      {...(fullWidth ? { flex: 1 } : {})}
      // Evento
      onPress={handlePress}
      // Style externo (solo los que no pisamos)
      {...(mergedStyle ? { style: mergedStyle } : {})}
    >
      {title}
    </Button>
  )
}

export default TamaguiButton
