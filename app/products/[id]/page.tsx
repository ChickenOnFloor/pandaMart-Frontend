'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGetProductByIdQuery } from '@/lib/api/api'
import { useAddToCartMutation } from '@/lib/api/api'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'
import gsap from 'gsap'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  category: string
  sellerId: string
  seller?: {
    name: string
  }
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const imageRef = useRef(null)
  const infoRef = useRef(null)
  
  // Use RTK Query hooks
  const { data: product, isLoading, error: productError } = useGetProductByIdQuery(resolvedId || '', {
    skip: !resolvedId,
  });
  const [addToCart] = useAddToCartMutation();

  useEffect(() => {
    params.then(p => setResolvedId(p.id))
  }, [params])

  useEffect(() => {
    if (product && !isLoading) {
      // Animate on load
      gsap.fromTo(imageRef.current,
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
      
      gsap.fromTo(infoRef.current,
        {
          opacity: 0,
          x: 50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
        }
      )
      
      setLoading(false);
    }
  }, [product, isLoading]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!product) return;

    try {
      setAddingToCart(true)
      await addToCart({ productId: product.id, quantity }).unwrap();
      // Show success message (toast would be better here)
      alert(`Added ${quantity} item(s) to cart!`)
      setQuantity(1) // Reset quantity
    } catch (err) {
      alert('Failed to add to cart')
      console.error('Failed to add to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 w-3/4 rounded" />
                <div className="h-4 bg-gray-200 w-1/2 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (productError || !product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {productError ? 'Failed to load product' : 'Product not found'}
            </h1>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline mb-6 font-semibold transition-all duration-300 hover:scale-105">
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div ref={imageRef} className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-xl">
            <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden shadow-lg group">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Product Info */}
          <div ref={infoRef} className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {product.name}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">{product.category}</p>
            </div>

            <Card className="shadow-2xl bg-white border-2 border-blue-100">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Price</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm font-medium">Stock</p>
                    <p className={`text-lg font-semibold px-4 py-2 rounded-full inline-block ${
                      product.stock > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : 'Out of stock'}
                    </p>
                  </div>

                  {product.seller && (
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Sold by</p>
                      <p className="font-medium text-lg">{product.seller.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-xl">
              <p className="text-gray-600 text-sm font-medium mb-2">Description</p>
              <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Seller Profile Link */}
            <div className="bg-white p-6 rounded-2xl border-2 border-purple-100 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    More from this seller
                  </h3>
                  {product.seller && (
                    <p className="text-gray-600">
                      View all products by <span className="font-semibold">{product.seller.name}</span>
                    </p>
                  )}
                </div>
                {product.seller && (
                  <Link href={`/seller/${product.sellerId}/products`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap px-6 py-3 text-lg">
                      See All Products
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-xl">
                <p className="text-gray-600 text-sm font-medium mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="bg-white border-2 border-gray-300 p-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="bg-white border-2 border-gray-300 p-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-500 ml-2">
                    (Max: {product.stock})
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg py-6"
            >
              {addingToCart
                ? 'Adding to cart...'
                : product.stock > 0
                  ? `Add ${quantity} to Cart`
                  : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}