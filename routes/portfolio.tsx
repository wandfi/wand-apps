import Portfolio from '@/app/portfolio/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/portfolio')({
  component: Portfolio,
})
