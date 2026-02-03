'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-12 pb-12 text-center">
        {icon && <div className="text-4xl mb-4">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick}>{action.label}</Button>
        )}
      </CardContent>
    </Card>
  )
}

export function NoProductsEmpty() {
  return (
    <EmptyState
      title="No products available"
      description="Check back later for more products"
    />
  )
}

export function NoCartEmpty({ onShop }: { onShop?: () => void }) {
  return (
    <EmptyState
      title="Your cart is empty"
      description="Start shopping to add items to your cart"
      action={onShop ? { label: 'Continue Shopping', onClick: onShop } : undefined}
    />
  )
}

export function NoDataEmpty({ title, description }: { title: string; description: string }) {
  return <EmptyState title={title} description={description} />
}
