/**
 * TamaguiSheet — Modal tipo sheet usando Tamagui Sheet
 *
 * Reemplazo progresivo para react-native-modal y <Modal> nativo.
 * Soporta snap points, backdrop press y animaciones nativas.
 *
 * @see https://tamagui.dev/ui/sheet
 */
import React from 'react'
import { Sheet, type SheetProps } from 'tamagui'

type TamaguiSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  snapPoints?: number[]
  title?: string
}

const TamaguiSheet: React.FC<TamaguiSheetProps> = ({
  open,
  onOpenChange,
  children,
  snapPoints = [85, 50],
  title,
}) => {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissOnSnapToBottom
      modal
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.5)"
      />
      <Sheet.Frame
        padding="$4"
        paddingTop="$6"
      >
        {title && (
          <Sheet.Handle />
        )}
        {children}
      </Sheet.Frame>
    </Sheet>
  )
}

export default TamaguiSheet
