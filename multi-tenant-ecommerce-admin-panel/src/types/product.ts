export type Product = {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  imageGallery: string[]
  graphics: string[]
  specs?: any
  categoryId: string
  storeId: string
  category?: {
    id: string
    name: string
    imageUrl?: string
  }
  store?: {
    id: string
    name: string
  }
  variants?: Variant[]
  createdAt: string
  updatedAt: string
}

export type Variant = {
  id: string
  name: string
  options: VariantOption[]
}

export type VariantOption = {
  id: string
  value: string
  priceModifier?: number
}