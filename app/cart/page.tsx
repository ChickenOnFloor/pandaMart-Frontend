'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { get, del } from '@/lib/api'
import gsap from 'gsap'

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  image: string
}

interface CartResponse {
  items: CartItem[]
  total: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const titleRef = useRef(null)
  const cartItemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCart()
    
    gsap.fromTo(titleRef.current,
      {
        opacity: 0,
        x: -50,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
      }
    )
  }, [])

  useEffect(() => {
    if (!loading && cartItemsRef.current) {
      const items = cartItemsRef.current.querySelectorAll('.cart-item')
      gsap.fromTo(items,
        {
          opacity: 0,
          x: -30,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      )
    }
  }, [loading, cart])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const data = await get<CartResponse>('/cart')
      setCart(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      setRemovingItem(productId)
      await del(`/cart/remove/${productId}`)
      setCart(cart.filter(item => item.productId !== productId))
      fetchCart() // Refresh cart total
    } catch (err) {
      console.error('Failed to remove item:', err)
      alert('Failed to remove item')
    } finally {
      setRemovingItem(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 w-1/4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">{error}</h1>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 ref={titleRef} className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div ref={cartItemsRef} className="lg:col-span-2 space-y-4">
            {cart.length === 0 ? (
              <Card className="shadow-xl bg-white">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              cart.map(item => (
                <Card 
                  key={item.productId} 
                  className="cart-item shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border-2 border-transparent hover:border-blue-300"
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800">{item.productName}</h3>
                        <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Qty: {item.quantity}
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={removingItem === item.productId}
                            className="transition-all duration-300 hover:scale-110"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl bg-white border-2 border-blue-100 sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="border-t-2 pt-4 flex justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {cart.length > 0 && (
                  <Link href="/checkout" className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl" 
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
