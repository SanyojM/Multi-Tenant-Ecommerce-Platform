import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Store APIs
export const getStoreByDomain = async (domain: string) => {
  const response = await api.get(`/store/domain/${domain}`);
  return response.data;
};

// Category APIs
export const getCategories = async (storeId: string) => {
  const response = await api.get(`/category/${storeId}`);
  return response.data;
};

// Product APIs
export const getProducts = async (storeId: string) => {
  const response = await api.get(`/product/store/${storeId}`);
  return response.data;
};

export const getProductById = async (productId: string) => {
  const response = await api.get(`/product/${productId}`);
  return response.data;
};

export const getProductsByCategory = async (categoryId: string) => {
  const response = await api.get(`/product/category/${categoryId}`);
  return response.data;
};

export const searchProducts = async (storeId: string, query: string) => {
  const response = await api.get(`/product/search/${storeId}?q=${query}`);
  return response.data;
};

// Cart APIs
export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const response = await api.post('/cart/add', { userId, productId, quantity });
  return response.data;
};

export const getCartItems = async (userId: string) => {
  const response = await api.get(`/cart/${userId}`);
  return response.data;
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
  const response = await api.patch(`/cart/${cartItemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (cartItemId: string) => {
  const response = await api.delete(`/cart/${cartItemId}`);
  return response.data;
};

export const clearCart = async (userId: string) => {
  const response = await api.delete(`/cart/clear/${userId}`);
  return response.data;
};

export const getCartTotal = async (userId: string) => {
  const response = await api.get(`/cart/${userId}/total`);
  return response.data;
};

// Order APIs
export const createOrder = async (data: {
  userId: string;
  storeId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  addressId?: string;
}) => {
  const response = await api.post('/order', data);
  return response.data;
};

export const getOrderById = async (orderId: string) => {
  const response = await api.get(`/order/${orderId}`);
  return response.data;
};

export const getUserOrders = async (userId: string) => {
  const response = await api.get(`/order/user/${userId}`);
  return response.data;
};

// Payment APIs
export const createPayment = async (orderId: string, amount: number, method: string) => {
  const response = await api.post('/payment', { orderId, amount, method });
  return response.data;
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  const response = await api.post('/payment/razorpay/create-order', { amount, currency });
  return response.data;
};

export const verifyRazorpayPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await api.post('/payment/razorpay/verify', data);
  return response.data;
};

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  const response = await api.patch(`/payment/${paymentId}/status`, { status });
  return response.data;
};

// User APIs
export const registerUser = async (data: {
  email: string;
  password: string;
  name?: string;
  storeId: string;
}) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string; storeId: string }) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};
