import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Dashboard() {
  return (
    <>
        <div className="flex justify-center w-full">
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <div>Overview Content</div>
                </TabsContent>
                <TabsContent value="analytics">
                    <div>Analytics Content</div>
                </TabsContent>
                <TabsContent value="reports">
                    <div>Reports Content</div>
                </TabsContent>
            </Tabs>
        </div>
    </>
  )
}
