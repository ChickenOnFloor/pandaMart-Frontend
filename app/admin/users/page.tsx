'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { get, del } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Users, User, Shield, Store, UserX } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'seller' | 'admin'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await get<User[]>('/admin/users')
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      setDeleting(userId)
      await del(`/admin/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const getUserRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'seller': return <Store className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getUserRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'seller': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              User Management
            </h1>
          </div>
          <p className="text-gray-600">Manage user accounts and roles</p>
        </div>

        <Separator className="my-8" />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300" />
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <Card className="shadow-xl border-2 border-purple-100">
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <Card 
                key={user.id}
                className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <h3 className="text-lg font-semibold truncate text-gray-800">{user.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 ml-8">
                        <span className="text-gray-600 text-sm">📧</span>
                        <p className="text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge 
                        className={`px-3 py-1 text-xs sm:text-sm font-medium capitalize whitespace-nowrap ${getUserRoleColor(user.role)}`}
                      >
                        <div className="flex items-center gap-1">
                          {getUserRoleIcon(user.role)}
                          {user.role}
                        </div>
                      </Badge>
                      <div className="flex gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="whitespace-nowrap transition-all duration-300 hover:scale-105"
                          >
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleting === user.id}
                          className="whitespace-nowrap transition-all duration-300 hover:scale-105"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && users.length > 0 && (
          <Card className="mt-8 shadow-xl border-2 border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                User Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{users.length}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'seller').length}
                  </p>
                  <p className="text-sm text-gray-600">Sellers</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                  <p className="text-sm text-gray-600">Regular Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
