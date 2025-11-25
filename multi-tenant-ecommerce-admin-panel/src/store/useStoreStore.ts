import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export type Store = {
  id: string
  name: string
  domain: string
  domainStatus: 'PENDING' | 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

type StoreState = {
  stores: Store[]
  selectedStore: Store | null
  loading: boolean
  error: string | null
  fetchStores: () => Promise<void>
  createStore: (storeData: { name: string; domain: string }) => Promise<void>
  updateStore: (id: string, storeData: { name: string; domain: string }) => Promise<void>
  deleteStore: (id: string) => Promise<void>
  setSelectedStore: (store: Store | null) => void
}

const BASE_URL = "http://localhost:3003"

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      stores: [],
      selectedStore: null,
      loading: false,
      error: null,

      fetchStores: async () => {
        set({ loading: true, error: null })
        try {
          const { data } = await axios.get(`${BASE_URL}/store`)
          set({ stores: data, loading: false })
          // Auto-select first store if none selected
          if (data.length > 0) {
            set((state) => ({
              selectedStore: state.selectedStore || data[0]
            }))
          }
        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false })
        }
      },

      createStore: async (storeData) => {
        set({ loading: true, error: null })
        try {
          const { data } = await axios.post(`${BASE_URL}/store`, storeData)
          set((state) => ({
            stores: [...state.stores, data],
            selectedStore: data, // Auto-select newly created store
            loading: false
          }))
        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false })
          throw err
        }
      },

      updateStore: async (id, storeData) => {
        set({ loading: true, error: null })
        try {
          const { data } = await axios.put(`${BASE_URL}/store/${id}`, storeData)
          set((state) => ({
            stores: state.stores.map((store) =>
              store.id === id ? data : store
            ),
            selectedStore: state.selectedStore?.id === id ? data : state.selectedStore,
            loading: false
          }))
        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false })
          throw err
        }
      },

      deleteStore: async (id) => {
        set({ loading: true, error: null })
        try {
          await axios.delete(`${BASE_URL}/store/${id}`)
          set((state) => ({
            stores: state.stores.filter((store) => store.id !== id),
            selectedStore: state.selectedStore?.id === id ? null : state.selectedStore,
            loading: false
          }))
        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false })
          throw err
        }
      },

      setSelectedStore: (store) => {
        set({ selectedStore: store })
      },
    }),
    {
      name: 'store-storage',
      partialize: (state) => ({ selectedStore: state.selectedStore }),
    }
  )
)
