/**
 * Client-side error handling composable
 */

import { useRoomStore } from '../stores/room'
import { logger } from '../utils/errorLogger'

export function useErrorHandler() {
  const store = useRoomStore()

  /**
   * Handle socket connection errors
   */
  function handleSocketError(error: Error, context?: Record<string, any>) {
    logger.error('Socket connection error', error, context)

    // Show user-friendly error message
    store.setError(
      'Connection error. Please check your network and try refreshing the page.',
      false
    )
  }

  /**
   * Handle room not found errors
   */
  function handleRoomNotFound(roomId: string) {
    logger.warn('Room not found', { roomId })

    store.setError(
      `Room "${roomId}" was not found. It may have been deleted or expired.`,
      true
    )
  }

  /**
   * Handle name conflict errors
   */
  function handleNameTaken(name: string, roomId: string) {
    logger.warn('Username already taken', { name, roomId })

    store.setError(
      `The username "${name}" is already taken in this room. Please choose another name.`,
      false
    )
  }

  /**
   * Handle generic errors
   */
  function handleGenericError(message: string, error?: Error, redirect = false) {
    logger.error(message, error)
    store.setError(message, redirect)
  }

  /**
   * Handle socket reconnection
   */
  function handleReconnecting(attempt: number) {
    logger.info('Socket reconnecting', { attempt })

    if (attempt === 1) {
      store.setError('Connection lost. Attempting to reconnect...', false)
    } else {
      store.setError(`Reconnection attempt ${attempt}...`, false)
    }
  }

  /**
   * Handle successful reconnection
   */
  function handleReconnected() {
    logger.info('Socket reconnected successfully')
    store.setError('') // Clear error message
  }

  /**
   * Handle failed reconnection
   */
  function handleReconnectFailed() {
    logger.error('Socket reconnection failed')

    store.setError(
      'Unable to reconnect. Please refresh the page to rejoin the room.',
      false
    )
  }

  return {
    handleSocketError,
    handleRoomNotFound,
    handleNameTaken,
    handleGenericError,
    handleReconnecting,
    handleReconnected,
    handleReconnectFailed,
  }
}
