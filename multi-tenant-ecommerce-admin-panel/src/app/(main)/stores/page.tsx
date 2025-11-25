"use client"

import { useState, useEffect } from 'react'
import { useStoreStore } from '@/store/useStoreStore'
import { Plus, Pencil, Trash2, Store as StoreIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StoresPage() {
  const { stores, loading, error, fetchStores, createStore, updateStore, deleteStore } = useStoreStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
  })

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createStore(formData)
      setFormData({ name: '', domain: '' })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create store:', error)
    }
  }

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStore) return
    
    try {
      await updateStore(editingStore.id, formData)
      setIsEditDialogOpen(false)
      setEditingStore(null)
      setFormData({ name: '', domain: '' })
    } catch (error) {
      console.error('Failed to update store:', error)
    }
  }

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store? This will also delete all products and categories.')) {
      return
    }
    
    try {
      await deleteStore(id)
    } catch (error) {
      console.error('Failed to delete store:', error)
    }
  }

  const openEditDialog = (store: any) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      domain: store.domain,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Stores Management</h1>
          <p className="text-gray-600 mt-1">Manage your stores and their configurations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#377b64] hover:bg-[#2d6350]">
              <Plus className="w-4 h-4" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Store</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome Store"
                  required
                />
              </div>
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="localhost:3001"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the domain where your store will be accessible
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#377b64] hover:bg-[#2d6350]">
                  Create Store
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#377b64] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <StoreIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Stores Yet</h3>
          <p className="text-gray-600 mb-4">Create your first store to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#d0fae2] rounded-lg flex items-center justify-center">
                    <StoreIcon className="w-6 h-6 text-[#377b64]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{store.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      store.domainStatus === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {store.domainStatus}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditDialog(store)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteStore(store.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Domain</p>
                  <p className="font-medium text-sm break-all">{store.domain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm">{new Date(store.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStore} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Store Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-domain">Domain</Label>
              <Input
                id="edit-domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#377b64] hover:bg-[#2d6350]">
                Update Store
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
