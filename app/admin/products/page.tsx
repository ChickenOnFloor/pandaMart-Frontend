'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { get, patch, del } from '@/lib/api'
import { Search, Package, CheckCircle, Clock, AlertCircle, User } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  approved: boolean
  seller?: {
    name: string
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchProducts()
  }, [filter])

  useEffect(() => {
    // Filter products based on search query
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.seller?.name && product.seller.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when searching
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'pending') params.append('approved', 'false')
      if (filter === 'approved') params.append('approved', 'true')

      const data = await get<Product[]>(`/admin/products?${params.toString()}`)
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId: string) => {
    try {
      setApprovingId(productId)
      await patch(`/admin/products/${productId}/approve`, {})
      setProducts(
        products.map(p => (p.id === productId ? { ...p, approved: true } : p))
      )
    } catch (err) {
      alert('Failed to approve product')
      console.error('Failed to approve product:', err)
    } finally {
      setApprovingId(null)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeletingId(productId)
      await del(`/admin/products/${productId}`)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      alert('Failed to delete product')
      console.error('Failed to delete product:', err)
    } finally {
      setDeletingId(null)
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Product Management
            </h1>
          </div>
          <p className="text-gray-600">Review and manage product listings</p>
        </div>

        <Separator className="my-8" />

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="transition-all duration-300 hover:scale-105"
          >
            <Package className="w-4 h-4 mr-2" />
            All Products
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className="transition-all duration-300 hover:scale-105 border-yellow-300 hover:border-yellow-400"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending Approval
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            className="transition-all duration-300 hover:scale-105 border-green-300 hover:border-green-400"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products by name or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-blue-100 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Products */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300" />
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="shadow-xl border-2 border-blue-100">
            <CardContent className="pt-12 pb-12 text-center">
              {searchQuery ? (
                <>
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
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
                  <p className="text-gray-500 text-lg">No products found</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {currentProducts.map(product => (
              <Card 
                key={product.id}
                className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300"
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
                          {product.seller && (
                            <div className="flex items-center gap-1 mt-1">
                              <User className="w-4 h-4 text-gray-500" />
                              <p className="text-sm text-gray-500">
                                Seller: <span className="font-medium">{product.seller.name}</span>
                              </p>
                            </div>
                          )}
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
                        {!product.approved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(product.id)}
                            disabled={approvingId === product.id}
                            className="w-full sm:w-auto whitespace-nowrap flex-1 sm:flex-none transition-all duration-300 hover:scale-105 border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="w-full sm:w-auto whitespace-nowrap flex-1 sm:flex-none transition-all duration-300 hover:scale-105"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
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
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
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
