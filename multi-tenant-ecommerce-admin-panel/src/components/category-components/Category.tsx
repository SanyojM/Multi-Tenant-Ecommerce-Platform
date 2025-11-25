"use client"

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AllCategories from './components/AllCategories'

export default function Category() {
  return (
    <>
        <div className="flex justify-center w-full">
            <Tabs defaultValue="all-categories">
                <TabsList>
                    <TabsTrigger value="all-categories">Category Management</TabsTrigger>
                    <TabsTrigger value="new-category">New Category</TabsTrigger>
                    <TabsTrigger value="update-category">Update Category</TabsTrigger>
                </TabsList>
                <TabsContent value="all-categories">
                    <AllCategories />
                </TabsContent>
                <TabsContent value="new-category">
                    {/* <NewCategory /> */}
                </TabsContent>
                <TabsContent value="update-category">
                    {/* <UpdateCategory /> */}
                </TabsContent>
            </Tabs>
        </div>
    </>
  )
}
