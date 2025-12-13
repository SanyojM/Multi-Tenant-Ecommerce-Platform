import { create } from 'zustand'
import axios from 'axios'

export type OrderItem = {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    imageGallery: string[]
  }
}

export type Order = {
  id: string
  userId: string
  storeId: string
  totalAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
  address?: {
    id: string
    fullName: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    country: string
    pincode: string
  }
  payment?: {
    id: string
    method: string
    status: string
    amount: number
  }
  items: OrderItem[]
}

type OrderState = {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchStoreOrders: (storeId: string) => Promise<void>
  getOrderById: (id: string) => Promise<Order | null>
  cancelOrder: (id: string) => Promise<void>
  updateOrderStatus: (id: string, status: string) => Promise<void>
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchStoreOrders: async (storeId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.get(`${BASE_URL}/order/store/${storeId}`)
      set({ orders: data, loading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
    }
  },

  getOrderById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.get(`${BASE_URL}/order/${id}`)
      set({ loading: false })
      return data
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
      return null
    }
  },

  cancelOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      await axios.delete(`${BASE_URL}/order/${id}`)
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== id),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
      throw err
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axios.post(`${BASE_URL}/order/${id}/status`, { status })
      set((state) => ({
        orders: state.orders.map((order) => 
          order.id === id ? { ...order, status: data.status, updatedAt: data.updatedAt } : order
        ),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false })
      throw err
    }
  },
}))
