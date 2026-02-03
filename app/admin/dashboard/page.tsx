'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Package, Clock, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react'
import { get } from '@/lib/api'
import { useEffect, useState } from 'react'

interface AdminStats {
  totalUsers: number
  totalProducts: number
  pendingApprovals: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await get<AdminStats>('/admin/stats')
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">Manage your e-commerce platform</p>
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
                  Total Users
                </CardTitle>
                <Users className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                <Badge variant="secondary" className="mt-2">Active accounts</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Products
                </CardTitle>
                <Package className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.totalProducts}</div>
                <Badge variant="secondary" className="mt-2">Live listings</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Approvals
                </CardTitle>
                <Clock className="w-5 h-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
                <Badge variant="secondary" className="mt-2">Needs review</Badge>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Separator className="my-8" />

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              User Management
            </h2>
            <div className="space-y-4">
              <Link href="/admin/users">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Manage Users
                      <Button variant="outline" size="sm">View All</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">View and manage user accounts and roles</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">View profiles</Badge>
                      <Badge variant="outline">Edit roles</Badge>
                      <Badge variant="outline">Delete accounts</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Product Management */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-500" />
              Product Management
            </h2>
            <div className="space-y-4">
              <Link href="/admin/products">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Approve Products
                      <Button variant="outline" size="sm">Review</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">Review and approve pending products</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Pending review</Badge>
                      <Badge variant="outline">Approve/Reject</Badge>
                      <Badge variant="outline">Edit listings</Badge>
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
