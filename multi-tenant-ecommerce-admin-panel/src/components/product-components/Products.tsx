"use client"

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AllProducts from './components/AllProducts'

export default function Products() {
  return (
    <>
        <div className="flex justify-center w-full">
            <Tabs defaultValue="all-products">
                <TabsList>
                    <TabsTrigger value="all-products">Products Management</TabsTrigger>
                    <TabsTrigger value="new-product">New Product</TabsTrigger>
                    <TabsTrigger value="update-product">Update Product</TabsTrigger>
                </TabsList>
                <TabsContent value="all-products">
                    <AllProducts />
                </TabsContent>
                <TabsContent value="new-product">
                    {/* <NewProduct /> */}
                </TabsContent>
                <TabsContent value="update-product">
                    {/* <UpdateProduct /> */}
                </TabsContent>
            </Tabs>
        </div>
    </>
  )
}
