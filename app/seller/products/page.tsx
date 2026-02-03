'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { get, del } from '@/lib/api'
import { useEffect, useState, useRef } from 'react'
import { Search, Package, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react'
import gsap from 'gsap'

interface SellerProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  approved: boolean
  image: string
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<SellerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const titleRef = useRef(null)
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProducts()
    
    gsap.fromTo(titleRef.current,
      {
        opacity: 0,
        y: -50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }
    )
  }, [])

  useEffect(() => {
    if (!loading && productsRef.current) {
      const items = productsRef.current.querySelectorAll('.product-item')
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
  }, [loading, currentPage])

  useEffect(() => {
    // Filter products based on search query
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when searching
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await get<SellerProduct[]>('/seller/products')
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeleting(productId)
      await del(`/seller/products/${productId}`)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      console.error('Failed to delete product:', err)
      alert('Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div ref={titleRef} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Products
            </h1>
          </div>
          <p className="text-gray-600">Manage your product listings and inventory</p>
        </div>

        <Separator className="my-8" />

        {/* Add Product Button */}
        <div className="mb-8">
          <Link href="/seller/products/new">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto">
              <Package className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-2 border-purple-100 focus:border-purple-500 transition-all duration-300"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="shadow-xl border-2 border-purple-100">
            <CardContent className="pt-12 pb-12 text-center">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No products match your search</p>
                  <Button 
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No products yet</p>
                  <Link href="/seller/products/new">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105">
                      Create Your First Product
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div ref={productsRef} className="space-y-4">
              {currentProducts.map(product => (
              <Card 
                key={product.id} 
                className="product-item hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-full sm:w-20 h-40 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 w-full min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                          <p className="text-gray-600 font-bold text-lg">${product.price.toFixed(2)}</p>
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <Badge 
                          variant={product.approved ? "default" : "secondary"}
                          className={`px-3 py-1 text-sm font-medium ${
                            product.approved 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {product.approved ? (
                            <><CheckCircle className="w-4 h-4 mr-1" /> Approved</>
                          ) : (
                            <><Clock className="w-4 h-4 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span className="font-medium">Stock:</span>
                          <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                            {product.stock} units
                          </span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <Link href={`/seller/products/${product.id}/edit`} className="flex-1 sm:flex-none">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full sm:w-auto whitespace-nowrap flex-1 sm:flex-none transition-all duration-300 hover:scale-105 border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="w-full sm:w-auto whitespace-nowrap flex-1 sm:flex-none transition-all duration-300 hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => goToPage(page)}
                      className={`transition-all duration-300 hover:scale-105 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : ''
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Results Info */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
            </p>
          </>
        )}
      </div>
    </main>
  )
}
