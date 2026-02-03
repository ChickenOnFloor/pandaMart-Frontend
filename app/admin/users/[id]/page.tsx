'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { get, patch, del } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface UserProduct {
  id: string
  name: string
  price: number
  approved: boolean
}

interface UserDetails {
  id: string
  name: string
  email: string
  role: 'user' | 'seller' | 'admin'
  products?: UserProduct[]
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function AdminUserDetailPage({ params }: PageProps) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<'user' | 'seller' | 'admin'>('user')
  const [updatingRole, setUpdatingRole] = useState(false)
  const [approvingProduct, setApprovingProduct] = useState<string | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setUserId(p.id))
  }, [params])

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      try {
        setLoading(true)
        const userData = await get<UserDetails>(`/admin/users/${userId}`)
        setUser(userData)
        setNewRole(userData.role)
      } catch (err) {
        setError('Failed to load user')
        console.error('Failed to fetch user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const handleUpdateRole = async () => {
    if (!user) return

    try {
      setUpdatingRole(true)
      await patch(`/admin/users/${user.id}/role`, { role: newRole })
      setUser({ ...user, role: newRole })
      alert('Role updated successfully')
    } catch (err) {
      alert('Failed to update role')
      console.error('Failed to update role:', err)
    } finally {
      setUpdatingRole(false)
    }
  }

  const handleApproveProduct = async (productId: string) => {
    try {
      setApprovingProduct(productId)
      await patch(`/admin/products/${productId}/approve`, {})
      if (user?.products) {
        setUser({
          ...user,
          products: user.products.map(p =>
            p.id === productId ? { ...p, approved: true } : p
          ),
        })
      }
    } catch (err) {
      alert('Failed to approve product')
      console.error('Failed to approve product:', err)
    } finally {
      setApprovingProduct(null)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeletingProduct(productId)
      await del(`/admin/products/${productId}`)
      if (user?.products) {
        setUser({
          ...user,
          products: user.products.filter(p => p.id !== productId),
        })
      }
    } catch (err) {
      alert('Failed to delete product')
      console.error('Failed to delete product:', err)
    } finally {
      setDeletingProduct(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-1/4" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">{error || 'User not found'}</h1>
            <Link href="/admin/users">
              <Button className="mt-4">Back to Users</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/admin/users" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Users
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{user.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Role</p>
                  <p className="font-semibold capitalize">{user.role}</p>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-2">Change Role</label>
                  <select
                    value={newRole}
                    onChange={e =>
                      setNewRole(e.target.value as 'user' | 'seller' | 'admin')
                    }
                    disabled={updatingRole}
                    className="w-full border rounded p-2 mb-2"
                  >
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    onClick={handleUpdateRole}
                    disabled={updatingRole || newRole === user.role}
                    className="w-full"
                  >
                    {updatingRole ? 'Updating...' : 'Update Role'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                {!user.products || user.products.length === 0 ? (
                  <p className="text-gray-500">No products</p>
                ) : (
                  <div className="space-y-4">
                    {user.products.map(product => (
                      <div key={product.id} className="border p-4 rounded flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-gray-600">${product.price.toFixed(2)}</p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-sm font-medium ${
                            product.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {!product.approved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveProduct(product.id)}
                              disabled={approvingProduct === product.id}
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingProduct === product.id}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
