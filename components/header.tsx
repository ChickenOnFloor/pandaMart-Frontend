'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { CartSlideIn } from '@/components/cart-slidein'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [cartOpen, setCartOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const getRoleLinks = () => {
    if (!user) return null

    const baseLinks: { href: string; label: string }[] = []

    if (user.role === 'seller' || user.role === 'admin') {
      baseLinks.push({ href: '/seller/dashboard', label: 'Seller Dashboard' })
    }

    if (user.role === 'admin') {
      baseLinks.push({ href: '/admin/dashboard', label: 'Admin Dashboard' })
    }

    return baseLinks
  }

  return (
    <>
      <header className="border-b sticky top-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              PandaMart
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {/* Products link removed since it's now the home page */}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCartOpen(true)}
                  size="icon"
                  className="relative hover:bg-blue-50 hover:border-blue-500 transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-500 transition-all">
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs font-medium text-blue-600 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {getRoleLinks().map(link => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href}>{link.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-500 transition-all">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <CartSlideIn isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
