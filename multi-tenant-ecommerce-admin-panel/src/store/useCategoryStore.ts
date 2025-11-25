import { create } from 'zustand'
import { Category } from '@/types/category'
import axios from 'axios'
import { URLS } from '@/lib/urls' // adjust path based on your structure

type CategoryState = {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: (storeId: string) => Promise<void>
  createCategory: (categoryData: FormData) => Promise<void>
  updateCategory: (id: string, categoryData: FormData) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (storeId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.get(URLS.GET_ALL_CATEGORIES(storeId))
      set({ categories: data, loading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  createCategory: async (categoryData: FormData) => {
    try {
      const { data } = await axios.post(URLS.CREATE_CATEGORY, categoryData)
      set((state) => ({
        categories: [...state.categories, data],
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message })
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const { data } = await axios.put(URLS.UPDATE_CATEGORY(id), categoryData)
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? data : cat
        ),
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message })
    }
  },

  deleteCategory: async (id) => {
    try {
      await axios.delete(URLS.DELETE_CATEGORY(id))
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message })
    }
  },
}))
