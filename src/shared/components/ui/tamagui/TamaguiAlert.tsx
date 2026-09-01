/**
 * TamaguiAlert — Diálogo de alerta estilizado con Tamagui AlertDialog
 *
 * Reemplazo para Alert.alert() con diseño de la marca Vibra.
 * Uso:
 *   showTamaguiAlert('Título', 'Mensaje')
 *   showTamaguiAlert('Error', 'Algo salió mal', { primaryLabel: 'Ok' })
 *
 * @see https://tamagui.dev/ui/alert-dialog
 */
import React, { useState, useCallback } from 'react'
import { AlertDialog, Button, XStack, YStack } from 'tamagui'
import useFontScale from '@/context/FontScaleContext'

type AlertOptions = {
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary?: () => void
  onSecondary?: () => void
  destructive?: boolean
}

type AlertState = {
  visible: boolean
  title: string
  message: string
  options: AlertOptions
}

let setGlobalAlert: React.Dispatch<React.SetStateAction<AlertState>> | null = null

/**
 * Muestra una alerta usando Tamagui AlertDialog (reemplazo de Alert.alert).
 *
 * @param title - Título del diálogo
 * @param message - Mensaje del diálogo
 * @param options - Opciones (etiquetas, callbacks)
 */
export function showTamaguiAlert(
  title: string,
  message: string,
  options: AlertOptions = {}
) {
  if (setGlobalAlert) {
    setGlobalAlert({
      visible: true,
      title,
      message,
      options,
    })
  }
}

/**
 * Provider que debe colocarse en el layout para habilitar showTamaguiAlert.
 * Renderiza el AlertDialog de Tamagui en la raíz de la app.
 */
export const TamaguiAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    options: {},
  })
  const { fontScale } = useFontScale()

  // Registrar el setter global
  React.useEffect(() => {
    setGlobalAlert = setAlert
    return () => { setGlobalAlert = null }
  }, [])

  const handleClose = useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }))
  }, [])

  return (
    <>
      {children}
      <AlertDialog open={alert.visible} onOpenChange={(open) => {
        if (!open) handleClose()
      }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            opacity={0.5}
            onPress={handleClose}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.95 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            width="85%"
            maxWidth={400}
          >
            <YStack gap="$3">
              <AlertDialog.Title fontWeight="bold" fontSize={20 * fontScale}>
                {alert.title}
              </AlertDialog.Title>
              <AlertDialog.Description fontSize={15 * fontScale} lineHeight={22} color="$color" opacity={0.8}>
                {alert.message}
              </AlertDialog.Description>

              <XStack gap="$3" justifyContent="flex-end" marginTop="$4">
                {alert.options.secondaryLabel && (
                  <AlertDialog.Cancel asChild>
                    <Button
                      theme="alt1"
                      onPress={() => {
                        alert.options.onSecondary?.()
                        handleClose()
                      }}
                    >
                      {alert.options.secondaryLabel}
                    </Button>
                  </AlertDialog.Cancel>
                )}
                <AlertDialog.Action asChild>
                  <Button
                    theme={alert.options.destructive ? 'red' : 'blue'}
                    onPress={() => {
                      alert.options.onPrimary?.()
                      handleClose()
                    }}
                  >
                    {alert.options.primaryLabel || 'Aceptar'}
                  </Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  )
}
