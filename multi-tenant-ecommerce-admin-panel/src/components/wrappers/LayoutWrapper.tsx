"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Settings, Box, User, Folder, LogOut, ShoppingCart, MessageCircle, Globe, Store } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname } from 'next/navigation'
import { useStoreStore } from '@/store/useStoreStore'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { stores, selectedStore, fetchStores, setSelectedStore } = useStoreStore()
    const urls = [
        { href: '/', icon: LayoutDashboard, name: 'Dashboard' },
        { href: '/stores', icon: Store, name: 'Stores' },
        { href: '/categories', icon: Folder, name: 'Categories' },
        { href: '/products', icon: Box, name: 'Products' },
        { href: '/orders', icon: ShoppingCart, name: 'Orders' },
        { href: '/users', icon: User, name: 'Users' },
        { href: '/feedback-reviews', icon: MessageCircle, name: 'Feedbacks & Reviews' },
        { href: '/website', icon: Globe, name: 'Website' },
        { href: '/personalization', icon: Settings, name: 'Personalization' },
    ]
    const pathname = usePathname();

    useEffect(() => {
        fetchStores()
    }, [fetchStores]);
  return (
    <div className='p-3'>
        <div className="flex gap-3">
            <div className="h-[97vh] overflow-y-auto rounded-lg bg-white p-2 border w-16 flex flex-col items-center justify-between space-y-18">
                <div className="flex flex-col items-center space-y-7">

                <img src="/logo.png" alt="Logo" className='bg-black p-2 rounded-[13px] w-10' />

                <div className="flex flex-col items-center w-full space-y-2 p-1">
                    {
                        urls.map((url) => (
                            <Tooltip key={url.href} delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <Link href={url.href} className={`hover:bg-[#d0fae2] p-2 rounded-lg transition-colors duration-200  ${pathname === url.href ? 'bg-[#d0fae2] text-[#377b64]' : ''}`}>
                                        <url.icon className='w-5 h-5' />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent className='bg-[#d0fae2] text-[#377b64] before:bg-[#d0fae2] text-sm font-semibold' side='right'>
                                    {url.name}
                                </TooltipContent>
                            </Tooltip>
                        ))
                    }
                    </div>
                </div>
                <span className='hover:bg-red-300 p-2 rounded-lg transition-colors duration-200'>
                    <LogOut className='w-5 h-5' />
                </span>
            </div>
            <div className='flex-1 w-full h-[97vh] flex flex-col gap-3'>
                {/* Store Selector */}
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                        <Store className="w-5 h-5 text-[#377b64]" />
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Selected Store
                            </label>
                            <Select
                                value={selectedStore?.id || ''}
                                onValueChange={(value) => {
                                    const store = stores.find(s => s.id === value)
                                    setSelectedStore(store || null)
                                }}
                            >
                                <SelectTrigger className="w-full max-w-md">
                                    <SelectValue placeholder="Select a store" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stores.map((store) => (
                                        <SelectItem key={store.id} value={store.id}>
                                            {store.name} ({store.domain})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {!selectedStore && stores.length > 0 && (
                            <div className="text-sm text-orange-600 font-medium">
                                Please select a store
                            </div>
                        )}
                        {stores.length === 0 && (
                            <div className="text-sm text-gray-600">
                                No stores available. <Link href="/stores" className="text-[#377b64] font-medium hover:underline">Create one</Link>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Main Content */}
                <div className='flex-1 overflow-y-auto'>
                    {children}
                </div>
            </div>
        </div>
    </div>
  )
}
