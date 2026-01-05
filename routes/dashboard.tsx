import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/app/dashboard/page'
export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})
