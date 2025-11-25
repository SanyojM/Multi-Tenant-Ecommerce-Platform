'use client'

import { useEffect, useState } from 'react'
import { useProductStore } from '@/store/useProductStore'
import { useCategoryStore } from '@/store/useCategoryStore'
import { useStoreStore } from '@/store/useStoreStore'
import {
  Card,
  CardContent,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, Eye } from 'lucide-react'

type SpecPair = {
  key: string
  value: string
}

export default function AllProducts() {
  const { selectedStore } = useStoreStore()

  const {
    products,
    fetchProducts,
    deleteProduct,
    createProduct,
    updateProduct,
    loading,
    error,
  } = useProductStore()

  const { categories, fetchCategories } = useCategoryStore()

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [previewProduct, setPreviewProduct] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    specs: [] as SpecPair[],
    imageFiles: [] as File[],
    graphicFiles: [] as File[],
    imagePreviews: [] as string[],
    graphicPreviews: [] as string[],
    existingImages: [] as string[],
    existingGraphics: [] as string[],
    removeImages: [] as string[],
    removeGraphics: [] as string[],
  })

  useEffect(() => {
    if(!selectedStore?.id) return
    fetchProducts(selectedStore.id)
    fetchCategories(selectedStore.id)
  }, [selectedStore?.id, fetchProducts, fetchCategories])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? All images and graphics will be removed.')) return
    setDeletingId(id)
    await deleteProduct(id)
    setDeletingId(null)
  }

  const handlePreview = (product: any) => {
    setPreviewProduct(product)
    setPreviewDialogOpen(true)
  }

  const handleEdit = (product: any) => {
    setSelectedProductId(product.id)
    
    // Parse specs from object/string to array of key-value pairs
    let specsArray: SpecPair[] = []
    if (product.specs) {
      try {
        // If specs is a string, parse it first
        const specsObj = typeof product.specs === 'string' 
          ? JSON.parse(product.specs) 
          : product.specs
        
        if (typeof specsObj === 'object' && specsObj !== null) {
          specsArray = Object.entries(specsObj).map(([key, value]) => ({
            key,
            value: String(value)
          }))
        }
      } catch (e) {
        console.error('Error parsing specs:', e)
      }
    }

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      specs: specsArray,
      imageFiles: [],
      graphicFiles: [],
      imagePreviews: [],
      graphicPreviews: [],
      existingImages: product.imageGallery || [],
      existingGraphics: product.graphics || [],
      removeImages: [],
      removeGraphics: [],
    })
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedProductId(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      specs: [],
      imageFiles: [],
      graphicFiles: [],
      imagePreviews: [],
      graphicPreviews: [],
      existingImages: [],
      existingGraphics: [],
      removeImages: [],
      removeGraphics: [],
    })
    setDialogOpen(true)
  }

  const addSpecPair = () => {
    setFormData({
      ...formData,
      specs: [...formData.specs, { key: '', value: '' }]
    })
  }

  const removeSpecPair = (index: number) => {
    const newSpecs = formData.specs.filter((_, i) => i !== index)
    setFormData({ ...formData, specs: newSpecs })
  }

  const updateSpecPair = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specs]
    newSpecs[index][field] = value
    setFormData({ ...formData, specs: newSpecs })
  }

  const sanitizeFilename = (filename: string): string => {
    const name = filename.substring(0, filename.lastIndexOf('.'))
    const ext = filename.substring(filename.lastIndexOf('.'))
    
    const sanitized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
    
    return sanitized + ext.toLowerCase()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const sanitizedFiles = files.map(file => {
      const sanitizedName = sanitizeFilename(file.name)
      return new File([file], sanitizedName, { type: file.type })
    })
    
    const previews = files.map(file => URL.createObjectURL(file))
    
    setFormData({
      ...formData,
      imageFiles: [...formData.imageFiles, ...sanitizedFiles],
      imagePreviews: [...formData.imagePreviews, ...previews],
    })
  }

  const handleGraphicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const sanitizedFiles = files.map(file => {
      const sanitizedName = sanitizeFilename(file.name)
      return new File([file], sanitizedName, { type: file.type })
    })
    
    const previews = files.map(file => URL.createObjectURL(file))
    
    setFormData({
      ...formData,
      graphicFiles: [...formData.graphicFiles, ...sanitizedFiles],
      graphicPreviews: [...formData.graphicPreviews, ...previews],
    })
  }

  const handleRemoveNewImage = (index: number) => {
    const newImageFiles = [...formData.imageFiles]
    const newPreviews = [...formData.imagePreviews]
    
    URL.revokeObjectURL(newPreviews[index])
    newImageFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setFormData({
      ...formData,
      imageFiles: newImageFiles,
      imagePreviews: newPreviews,
    })
  }

  const handleRemoveNewGraphic = (index: number) => {
    const newGraphicFiles = [...formData.graphicFiles]
    const newPreviews = [...formData.graphicPreviews]
    
    URL.revokeObjectURL(newPreviews[index])
    newGraphicFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setFormData({
      ...formData,
      graphicFiles: newGraphicFiles,
      graphicPreviews: newPreviews,
    })
  }

  const handleRemoveExistingImage = (url: string) => {
    setFormData({
      ...formData,
      existingImages: formData.existingImages.filter(img => img !== url),
      removeImages: [...formData.removeImages, url],
    })
  }

  const handleRemoveExistingGraphic = (url: string) => {
    setFormData({
      ...formData,
      existingGraphics: formData.existingGraphics.filter(gfx => gfx !== url),
      removeGraphics: [...formData.removeGraphics, url],
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || !formData.price || !formData.stock) {
      alert('Please fill in all required fields')
      return
    }

    const price = parseFloat(formData.price)
    const stock = parseInt(formData.stock)
    
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price')
      return
    }
    
    if (isNaN(stock) || stock < 0) {
      alert('Please enter a valid stock quantity')
      return
    }

    const formdata = new FormData()
    formdata.append('name', formData.name)
    formdata.append('description', formData.description)
    formdata.append('price', price.toString())
    formdata.append('stock', stock.toString())
    formdata.append('categoryId', formData.categoryId)
    
    // Convert specs array to object
    if (formData.specs.length > 0) {
      const specsObject: Record<string, string> = {}
      formData.specs.forEach(spec => {
        if (spec.key.trim()) {
          specsObject[spec.key.trim()] = spec.value.trim()
        }
      })
      formdata.append('specs', JSON.stringify(specsObject))
    }
    
    formData.imageFiles.forEach(file => {
      formdata.append('images', file)
    })
    
    formData.graphicFiles.forEach(file => {
      formdata.append('graphics', file)
    })
    
    if (selectedProductId) {
      if (formData.removeImages.length > 0) {
        formdata.append('removeImages', JSON.stringify(formData.removeImages))
      }
      if (formData.removeGraphics.length > 0) {
        formdata.append('removeGraphics', JSON.stringify(formData.removeGraphics))
      }
      await updateProduct(selectedProductId, formdata)
    } else {
      formdata.append('storeId', selectedStore?.id || '')
      await createProduct(formdata)
    }
    
    setDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    formData.imagePreviews.forEach(url => URL.revokeObjectURL(url))
    formData.graphicPreviews.forEach(url => URL.revokeObjectURL(url))
    
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      specs: [],
      imageFiles: [],
      graphicFiles: [],
      imagePreviews: [],
      graphicPreviews: [],
      existingImages: [],
      existingGraphics: [],
      removeImages: [],
      removeGraphics: [],
    })
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
        <Button onClick={handleAdd}>+ Add Product</Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && products.length === 0 ? (
        <p className="text-muted-foreground">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {product.imageGallery && product.imageGallery.length > 0 ? (
                  <img 
                    src={product.imageGallery[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => handlePreview(product)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">${product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                <div className="grid gap-2 grid-cols-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProductId ? 'Update Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Specifications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecPair}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Spec
                </Button>
              </div>
              <div className="space-y-2">
                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Key (e.g., color)"
                      value={spec.key}
                      onChange={(e) => updateSpecPair(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., red)"
                      value={spec.value}
                      onChange={(e) => updateSpecPair(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSpecPair(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.specs.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No specifications added. Click "Add Spec" to add key-value pairs.
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Product Images</Label>
              {formData.existingImages.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-2">Existing Images:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.existingImages.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt="Existing" className="w-full h-24 object-cover rounded" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveExistingImage(url)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formData.imagePreviews.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-2">New Images:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.imagePreviews.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt="Preview" className="w-full h-24 object-cover rounded" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveNewImage(idx)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </div>

            <div>
              <Label>Product Graphics</Label>
              {formData.existingGraphics.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-2">Existing Graphics:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.existingGraphics.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt="Existing Graphic" className="w-full h-24 object-cover rounded" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveExistingGraphic(url)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formData.graphicPreviews.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-2">New Graphics:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.graphicPreviews.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt="Preview Graphic" className="w-full h-24 object-cover rounded" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => handleRemoveNewGraphic(idx)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGraphicChange}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedProductId ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
          </DialogHeader>
          {previewProduct && (
            <div className="space-y-6">
              {/* Image Gallery */}
              <div>
                <h3 className="font-semibold mb-3">Product Images</h3>
                {previewProduct.imageGallery && previewProduct.imageGallery.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {previewProduct.imageGallery.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No images available</p>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Product Name</Label>
                  <p className="font-semibold text-lg">{previewProduct.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Category</Label>
                  <p className="font-semibold">{previewProduct.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Price</Label>
                  <p className="font-semibold text-lg text-green-600">${previewProduct.price}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Stock</Label>
                  <p className="font-semibold">{previewProduct.stock} units</p>
                </div>
              </div>

              {/* Description */}
              {previewProduct.description && (
                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="mt-1">{previewProduct.description}</p>
                </div>
              )}

              {/* Specifications */}
              {previewProduct.specs && Object.keys(JSON.parse(previewProduct.specs)).length > 0 && (
                <div>
                  <Label className="text-gray-500 mb-2 block">Specifications</Label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(JSON.parse(previewProduct.specs)).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2 last:border-b-0">
                        <span className="font-medium capitalize">{key}:</span>
                        <span className="text-gray-700">{String(value)}</span>
                      </div> 
                    ))}
                  </div>
                </div>
              )}

              {/* Graphics */}
              {previewProduct.graphics && previewProduct.graphics.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Product Graphics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {previewProduct.graphics.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Graphic ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}