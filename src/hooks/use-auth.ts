import { signOutFn } from '@/server/functions/auth'
import { useLoaderData, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Models } from 'node-appwrite'

export function useAuth() {
  const { currentUser } = useLoaderData({ from: '__root__' }) as {
    currentUser: Models.User<Models.Preferences>
  }
  const signOutServer = useServerFn(signOutFn)
  const router = useRouter()

  const signOut = async () => {
    await signOutServer()
    await router.invalidate()
  }

  return {
    currentUser,
    signOut,
  }
}
