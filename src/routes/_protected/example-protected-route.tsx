import { useAuth } from '@/hooks/use-auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/example-protected-route')({
  component: RouteComponent,
})

function RouteComponent({}) {
  const { currentUser } = useAuth()
  return <div>Protected {currentUser?.email}</div>
}
