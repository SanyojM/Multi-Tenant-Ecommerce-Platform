import { create } from 'zustand'
import { Product } from '@/types/product'
import axios from 'axios'
import { URLS } from '@/lib/urls'

type ProductState = {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: (storeId: string) => Promise<void>
  fetchProductsByCategory: (categoryId: string) => Promise<void>
  fetchProductById: (id: string) => Promise<Product | null>
  createProduct: (productData: FormData) => Promise<void>
  updateProduct: (id: string, productData: FormData) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateStock: (id: string, stock: number) => Promise<void>
  searchProducts: (storeId: string, query: string) => Promise<void>
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (storeId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.get(URLS.GET_ALL_PRODUCTS(storeId))
      set({ products: data, loading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  fetchProductsByCategory: async (categoryId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.get(`${URLS.GET_ALL_PRODUCTS('')}/category/${categoryId}`)
      set({ products: data, loading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.get(URLS.GET_PRODUCT_BY_ID(id))
      set({ loading: false })
      return data
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
      return null
    }
  },

  createProduct: async (productData: FormData) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.post(URLS.CREATE_PRODUCT, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      set((state) => ({
        products: [data, ...state.products],
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.put(URLS.UPDATE_PRODUCT(id), productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      set((state) => ({
        products: state.products.map((prod) =>
          prod.id === id ? data : prod
        ),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await axios.delete(URLS.DELETE_PRODUCT(id))
      set((state) => ({
        products: state.products.filter((prod) => prod.id !== id),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  updateStock: async (id, stock) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.patch(`${URLS.UPDATE_PRODUCT(id)}/stock`, { stock })
      set((state) => ({
        products: state.products.map((prod) =>
          prod.id === id ? data : prod
        ),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  searchProducts: async (storeId, query) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.get(`${URLS.GET_ALL_PRODUCTS(storeId)}/search?q=${query}`)
      set({ products: data, loading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },
}))