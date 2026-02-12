'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { MobileFilters } from '@/components/mobile-filters'
import { useGetProductsQuery } from '@/lib/api/api'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  category: string
}

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other']
const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: 'Over $500', min: 500, max: Infinity },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  
  const titleRef = useRef(null)
  const filtersRef = useRef(null)
  const productsGridRef = useRef<HTMLDivElement>(null)

  // Use RTK Query hook for fetching products
  const { data: allProducts = [], isLoading, refetch } = useGetProductsQuery({
    search,
    category: category !== 'all' ? category : undefined,
    inStock: inStockOnly ? 'true' : undefined,
    ...(priceRange !== 'all' && {
      minPrice: PRICE_RANGES.find(r => r.label === priceRange)?.min?.toString(),
      maxPrice: PRICE_RANGES.find(r => r.label === priceRange)?.max === Infinity 
        ? '999999' 
        : PRICE_RANGES.find(r => r.label === priceRange)?.max?.toString(),
    })
  });

  // Apply filters client-side to fetched data
  const filteredProducts = allProducts.filter((product: Product) => {
    // Apply search filter
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Apply category filter
    if (category !== 'all' && !product.category.toLowerCase().includes(category.toLowerCase())) {
      return false;
    }
    
    // Apply in stock filter
    if (inStockOnly && product.stock <= 0) {
      return false;
    }
    
    // Apply price range filter
    if (priceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.label === priceRange);
      if (range) {
        if (product.price < range.min || (range.max !== Infinity && product.price > range.max)) {
          return false;
        }
      }
    }
    
    return true;
  });

  useEffect(() => {
    // Animate title on mount
    gsap.fromTo(titleRef.current, 
      {
        opacity: 0,
        y: -50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      }
    )

    // Animate left sidebar filters from left
    gsap.fromTo(filtersRef.current,
      {
        opacity: 0,
        x: -100,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out',
      }
    )
  }, [])

  useEffect(() => {
    // Animate products when they load
    if (!isLoading && productsGridRef.current) {
      const cards = productsGridRef.current.querySelectorAll('.product-card')
      gsap.fromTo(cards,
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        }
      )
    }
  }, [isLoading, allProducts])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Mobile Filters - Fixed position but scrollable */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <MobileFilters
            category={category}
            setCategory={setCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
          />
        </div>
              
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters (Desktop only) */}
          <aside ref={filtersRef} className="hidden lg:block w-full lg:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl sticky top-24">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Filters
            </h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Search</label>
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700">Categories</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                  <Checkbox
                    checked={category === 'all'}
                    onCheckedChange={() => setCategory('all')}
                  />
                  <span className="text-sm">All Categories</span>
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <Checkbox
                      checked={category === cat.toLowerCase()}
                      onCheckedChange={() => setCategory(cat.toLowerCase())}
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700">Price Range</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                  <Checkbox
                    checked={priceRange === 'all'}
                    onCheckedChange={() => setPriceRange('all')}
                  />
                  <span className="text-sm">All Prices</span>
                </label>
                {PRICE_RANGES.map(range => (
                  <label key={range.label} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <Checkbox
                      checked={priceRange === range.label.toLowerCase()}
                      onCheckedChange={() => setPriceRange(range.label.toLowerCase())}
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <Checkbox
                  checked={inStockOnly}
                  onCheckedChange={() => setInStockOnly(!inStockOnly)}
                />
                <span className="text-sm font-medium">In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <h1 ref={titleRef} className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discover Products
          </h1>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <CardHeader>
                    <div className="h-4 bg-gray-200 w-3/4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 w-1/2 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <div ref={productsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: Product, index: number) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card 
                    className="product-card h-full hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden border-2 border-transparent hover:border-blue-500 bg-white"
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1.05,
                        duration: 0.3,
                        ease: 'power2.out',
                      })
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out',
                      })
                    }}
                  >
                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0 ? 'In stock' : 'Out of stock'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Stock: {product.stock} available
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </main>
)
}