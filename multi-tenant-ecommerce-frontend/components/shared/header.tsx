'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'

interface HeaderProps {
  store?: {
    name: string;
    logoUrl?: string;
  };
}

export default function Header({ store }: HeaderProps) {
    const { pathname } = useRouter()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { getItemCount, fetchCartItems } = useCartStore()
    const { user, isAuthenticated } = useAuthStore()
    const cartItemCount = getItemCount()

    useEffect(() => {
      if (user?.id) {
        fetchCartItems()
      }
    }, [user?.id, fetchCartItems])

    const urls = [
        { name: 'Home', link: '/' },
        { name: 'Products', link: '/products' },
        { name: 'Categories', link: '/categories' },
        { name: 'Orders', link: '/orders' },
    ]

    const isActive = (link: string) => {
        if (link === '/') return pathname === '/'
        return pathname === link || pathname.startsWith(link + '/')
    }

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        setShowSearch(false)
      }
    }

    return (
        <div className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        {store?.logoUrl ? (
                            <img src={store.logoUrl} alt={store.name} className="h-10" />
                        ) : (
                            <span className="text-2xl font-bold text-blue-600">
                                {store?.name || 'Store'}
                            </span>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {urls.map((url) => {
                            const active = isActive(url.link)
                            return (
                                <Link
                                    key={url.name}
                                    href={url.link}
                                    className={`text-sm font-medium transition-colors ${
                                        active 
                                            ? 'text-blue-600 border-b-2 border-blue-600' 
                                            : 'text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                    {url.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Search className="h-5 w-5" />
                        </button>

                        {/* User */}
                        <Link
                            href={isAuthenticated ? '/profile' : '/login'}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <User className="h-5 w-5" />
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
                            <ShoppingBag className="h-5 w-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="pb-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col space-y-4">
                            {urls.map((url) => {
                                const active = isActive(url.link)
                                return (
                                    <Link
                                        key={url.name}
                                        href={url.link}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-sm font-medium py-2 px-4 rounded ${
                                            active 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {url.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </div>
    )
}
