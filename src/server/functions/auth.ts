import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { redirect } from '@tanstack/react-router'
import { createAdminClient, createSessionClient } from '../lib/appwrite'
import { AppwriteException, ID } from 'node-appwrite'
import {
  deleteCookie,
  getCookie,
  setCookie,
  setResponseStatus,
  getRequestHeader,
} from '@tanstack/react-start/server'

export const getAppwriteSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = getCookie(`appwrite-session-secret`)

    if (!session) {
      return null
    }

    return session
  },
)

const setAppwriteSessionCookiesSchema = z.object({
  id: z.string(),
  secret: z.string(),
  expires: z.string().optional(), // ISO 8601 format string from Appwrite session.expire
})

export const setAppwriteSessionCookiesFn = createServerFn({ method: 'POST' })
  .inputValidator(setAppwriteSessionCookiesSchema)
  .handler(
    async ({
      data,
    }: {
      data: z.infer<typeof setAppwriteSessionCookiesSchema>
    }) => {
      const { id, secret, expires } = data

      // Calculate maxAge in seconds (default to 30 days if no expiration provided)
      // Appwrite expire is always an ISO 8601 format string (e.g., "2020-10-15T06:38:00.000+00:00")
      let maxAge = 30 * 24 * 60 * 60 // Default: 30 days in seconds
      if (expires) {
        const expireTime = Math.floor(new Date(expires).getTime() / 1000)
        const now = Math.floor(Date.now() / 1000)
        maxAge = Math.max(0, expireTime - now)
      }

      // Set cookies with explicit expiration
      setCookie(`appwrite-session-secret`, secret, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge,
        path: '/',
      })

      setCookie(`appwrite-session-id`, id, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge,
        path: '/',
      })
    },
  )

const signUpInSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  redirect: z.string().optional(),
})

export const signUpFn = createServerFn({ method: 'POST' })
  .inputValidator(signUpInSchema)
  .handler(async ({ data }) => {
    const { email, password, redirect: redirectUrl } = data
    const { account } = createAdminClient()

    try {
      // Get the base URL from the origin header (includes protocol)
      const origin = getRequestHeader('origin')
      if (!origin) {
        throw new Error('Missing origin header')
      }

      // Ensure Appwrite gets the origin header
      account.client.addHeader('origin', origin)

      await account.create({ userId: ID.unique(), email, password })
      const session = await account.createEmailPasswordSession({
        email,
        password,
      })
      await setAppwriteSessionCookiesFn({
        data: {
          id: session.$id,
          secret: session.secret,
          expires: session.expire || undefined, // ISO 8601 format string
        },
      })
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }

    if (redirectUrl) {
      throw redirect({ to: redirectUrl })
    } else {
      throw redirect({ to: '/' })
    }
  })

export const signInFn = createServerFn({ method: 'POST' })
  .inputValidator(signUpInSchema)
  .handler(async ({ data }) => {
    const { email, password, redirect: redirectUrl } = data
    const { account } = createAdminClient()

    try {
      // Get the base URL from the origin header (includes protocol)
      const origin = getRequestHeader('origin')
      if (!origin) {
        throw new Error('Missing origin header')
      }

      // Ensure Appwrite gets the origin header
      account.client.addHeader('origin', origin)

      const session = await account.createEmailPasswordSession({
        email,
        password,
      })
      await setAppwriteSessionCookiesFn({
        data: {
          id: session.$id,
          secret: session.secret,
          expires: session.expire || undefined, // ISO 8601 format string
        },
      })
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }

    if (redirectUrl) {
      throw redirect({ to: redirectUrl })
    } else {
      throw redirect({ to: '/' })
    }
  })

export const signOutFn = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const session = await getAppwriteSessionFn()

    if (session) {
      const client = await createSessionClient(session)
      // Delete the session on Appwrite server
      await client.account.deleteSession({ sessionId: 'current' })
    }
  } catch (error) {
    // Even if session deletion fails, we still want to clear local cookies
    console.error('Error deleting session:', error)
  } finally {
    // Always delete the cookies
    clearAuthCookies()
  }
})

export const authMiddleware = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentUser = await getCurrentUser()

    return {
      currentUser,
    }
  },
)

const clearAuthCookies = () => {
  deleteCookie(`appwrite-session-secret`)
  deleteCookie(`appwrite-session-id`)
  deleteCookie(`a_session_${process.env.APPWRITE_PROJECT_ID}`)
}

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAppwriteSessionFn()

    if (!session) {
      return null
    }

    try {
      const client = await createSessionClient(session)
      const currentUser = await client.account.get()
      return currentUser
    } catch (_error) {
      const error = _error as AppwriteException
      if (error.code === 401) {
        clearAuthCookies()
      }
      return null
    }
  },
)

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const forgotPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const { email } = data
    const { account } = createAdminClient()

    try {
      // Get the base URL from the origin header (includes protocol)
      const origin = getRequestHeader('origin')
      if (!origin) {
        throw new Error('Missing origin header')
      }

      // Ensure Appwrite gets the origin header
      account.client.addHeader('origin', origin)

      const resetUrl = `${origin}/reset-password`
      await account.createRecovery({ email, url: resetUrl })

      return {
        success: true,
        message: 'Password recovery email sent successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }
  })

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Secret is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const { userId, secret, password, confirmPassword } = data
    const { account } = createAdminClient()

    if (password !== confirmPassword) {
      setResponseStatus(400)
      throw {
        message: 'Passwords do not match',
        status: 400,
      }
    }

    try {
      // Get the base URL from the origin header (includes protocol)
      const origin = getRequestHeader('origin')
      if (!origin) {
        throw new Error('Missing origin header')
      }

      // Ensure Appwrite gets the origin header
      account.client.addHeader('origin', origin)

      await account.updateRecovery({
        userId,
        secret,
        password,
      })

      return {
        success: true,
        message: 'Password reset successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message,
        status: error.code,
      }
    }
  })
