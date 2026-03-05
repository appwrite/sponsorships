import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

export const getBaseUrl = createServerFn({ method: 'GET' }).handler(() => {
  const origin = getRequestHeader('origin')
  const host = getRequestHeader('host')

  // Prefer origin header, fall back to constructing from host
  if (origin) {
    return origin
  }

  if (host) {
    // Determine protocol - default to https in production
    const protocol =
      process.env.NODE_ENV === 'production' ||
      getRequestHeader('x-forwarded-proto') === 'https'
        ? 'https'
        : 'http'
    return `${protocol}://${host}`
  }

  // Final fallback
  return `https://imagine-${import.meta.env.VITE_APPWRITE_PROJECT_ID}.appwrite.network`
})
