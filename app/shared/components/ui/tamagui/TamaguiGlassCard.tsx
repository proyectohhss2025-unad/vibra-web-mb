/**
 * TamaguiGlassCard — Card con efecto glassmorphism usando Tamagui Card
 *
 * Reemplaza a GlassCard (shared/components/ui/GlassCard.tsx).
 * Misma API: { children, style? }
 *
 * Diseño según spec SW-001:
 * - Fondo semi-transparente rgba(255,255,255,0.08)
 * - Borde sutil rgba(255,255,255,0.15)
 * - Border radius 16px
 * - Padding interno 24px
 *
 * @see https://tamagui.dev/ui/card
 */
import { type ViewStyle } from 'react-native'
import { Card } from 'tamagui'

type TamaguiGlassCardProps = {
  children: React.ReactNode
  style?: ViewStyle
}

const TamaguiGlassCard: React.FC<TamaguiGlassCardProps> = ({ children, style }) => {
  return (
    <Card
      backgroundColor="rgba(255,255,255,0.08)"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.15)"
      borderRadius={16}
      padding={24}
      {...(style ? { style } : {})}
    >
      {children}
    </Card>
  )
}

export default TamaguiGlassCard
