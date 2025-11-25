'use client'

import { useEffect, useState } from 'react'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useStoreStore } from '@/store/useStoreStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AllCategories() {
  const { selectedStore } = useStoreStore()

  const {
    categories,
    fetchCategories,
    deleteCategory,
    createCategory,
    updateCategory,
    loading,
    error,
  } = useCategoryStore()

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    imageFile: null as File | null,
    previewUrl: '',
  })

  useEffect(() => {
    if (!selectedStore?.id) return
    fetchCategories(selectedStore.id)
  }, [selectedStore?.id, fetchCategories])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteCategory(id)
    setDeletingId(null)
  }

  const handleEdit = (category: any) => {
    setSelectedCategoryId(category.id)
    setFormData({
      name: category.name,
      imageFile: null,
      previewUrl: category.imageUrl,
    })
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedCategoryId(null)
    setFormData({ name: '', imageFile: null, previewUrl: '' })
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
        previewUrl: URL.createObjectURL(file),
      })
    }
  }

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageFile: null,
      previewUrl: '',
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || (!formData.previewUrl && !formData.imageFile)) return
    if (!selectedStore?.id) return

    const formdata = new FormData()
    formdata.append('name', formData.name)
    formdata.append('storeId', selectedStore.id)
    if (formData.imageFile) {
      formdata.append('image', formData.imageFile)
    }

    if (selectedCategoryId) {
      formdata.append('id', selectedCategoryId)
      await updateCategory(selectedCategoryId, formdata)
    } else {
      await createCategory(formdata)
    }

    setDialogOpen(false)
    setFormData({ name: '', imageFile: null, previewUrl: '' })
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Categories</h1>
        <Button onClick={handleAdd}>+ Add Category</Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && categories.length === 0 ? (
        <p className="text-muted-foreground">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">No categories found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card className='p-0' key={category.id}>
              <img src={category.imageUrl} alt={category.name} className='h-32 w-32 mx-auto' />
              <div className="text-lg font-bold p-4 pt-1">
                {category.name}
                <div className="grid gap-3 grid-cols-2 mt-2">
                  <Button
                  variant="destructive"
                  onClick={() => handleDelete(category.id)}
                  disabled={deletingId === category.id}
                >
                  {deletingId === category.id ? 'Deleting...' : 'Delete'}
                </Button>
                <Button variant="secondary" onClick={() => handleEdit(category)}>
                  Update
                </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategoryId ? 'Update Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
              />
            </div>

            <div>
              <Label>Image</Label>
              {formData.previewUrl ? (
                <div className="relative">
                  <img
                    src={formData.previewUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <Button variant="outline" onClick={handleRemoveImage}>
                    Remove Image
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedCategoryId ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
