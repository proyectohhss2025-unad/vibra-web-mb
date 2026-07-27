import React from 'react'
import { useFocusEffect } from 'expo-router'

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
    const firstTimeRef = React.useRef(true)

    /**
     * @description
     * Refreshes the data when the screen is focused.
     *
     * @example
     * useRefreshOnFocus(() => refetch())
     */
    useFocusEffect(
        React.useCallback(() => {
            if (firstTimeRef.current) {
                firstTimeRef.current = false
                return
            }

            refetch()
        }, [refetch]),
    )
}