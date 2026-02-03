'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { get, post, del } from '@/lib/api'
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react'
import gsap from 'gsap'
import { useRouter } from 'next/navigation'

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  image: string
}

interface CartData {
  items: CartItem[]
  total: number
}

interface CartSlideInProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSlideIn({ isOpen, onClose }: CartSlideInProps) {
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchCart()
      // Animate in
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.fromTo(panelRef.current,
        { x: '100%' },
        {
          x: '0%',
          duration: 0.4,
          ease: 'power3.out',
        }
      )
    } else {
      // Animate out
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in',
      })
    }
  }, [isOpen])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const data = await get<CartData>('/cart')
      setCart(data)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return

    try {
      setUpdating(productId)
      await post('/cart/add', { productId, quantity })
      await fetchCart()
    } catch (err) {
      console.error('Failed to update cart:', err)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (productId: string) => {
    try {
      setUpdating(productId)
      await del(`/cart/remove/${productId}`)
      await fetchCart()
    } catch (err) {
      console.error('Failed to remove item:', err)
    } finally {
      setUpdating(null)
    }
  }

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 opacity-0"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col translate-x-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
              ))}
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add some products to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-blue-600 font-bold mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={updating === item.productId || item.quantity <= 1}
                          className="bg-white border border-gray-300 p-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={updating === item.productId}
                          className="bg-white border border-gray-300 p-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          disabled={updating === item.productId}
                          className="ml-auto text-red-500 hover:text-red-700 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${cart.total.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
