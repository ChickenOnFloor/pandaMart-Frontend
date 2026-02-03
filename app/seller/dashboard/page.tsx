'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, CheckCircle, Clock, TrendingUp, ShoppingCart, DollarSign, Plus } from 'lucide-react'
import { get } from '@/lib/api'
import { useEffect, useState } from 'react'

interface SellerStats {
  totalProducts: number
  approvedProducts: number
  pendingProducts: number
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await get<SellerStats>('/seller/stats')
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Seller Dashboard
              </h1>
            </div>
            <p className="text-gray-600">Manage your product listings and sales</p>
          </div>
          <Link href="/seller/products/new">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        <Separator className="my-8" />

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-8 bg-gray-200 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Products
                </CardTitle>
                <Package className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalProducts}</div>
                <Badge variant="secondary" className="mt-2">All listings</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Approved
                </CardTitle>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.approvedProducts}</div>
                <Badge variant="secondary" className="mt-2">Live on store</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Approval
                </CardTitle>
                <Clock className="w-5 h-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.pendingProducts}</div>
                <Badge variant="secondary" className="mt-2">Under review</Badge>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Separator className="my-8" />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Management */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-500" />
              Product Management
            </h2>
            <div className="space-y-4">
              <Link href="/seller/products">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Manage Products
                      <Button variant="outline" size="sm">View All</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">View, edit, and delete your products</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Edit listings</Badge>
                      <Badge variant="outline">Update prices</Badge>
                      <Badge variant="outline">Manage stock</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Add New Product */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-pink-500" />
              Create New Listing
            </h2>
            <div className="space-y-4">
              <Link href="/seller/products/new">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-pink-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Add New Product
                      <Button variant="outline" size="sm">Create</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">Create a new product listing</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Add images</Badge>
                      <Badge variant="outline">Set pricing</Badge>
                      <Badge variant="outline">Configure stock</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
