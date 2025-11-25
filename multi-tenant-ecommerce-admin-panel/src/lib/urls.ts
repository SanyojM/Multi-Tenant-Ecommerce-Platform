const BASE_URL = "http://localhost:3003"

export const URLS = {
    GET_ALL_CATEGORIES: (storeId: string) => `${BASE_URL}/category/${storeId}`,
    GET_CATEGORY_BY_ID: (id: string) => `${BASE_URL}/category/id/${id}`,
    CREATE_CATEGORY: `${BASE_URL}/category`,
    UPDATE_CATEGORY: (id: string) => `${BASE_URL}/category/${id}`,
    DELETE_CATEGORY: (id: string) => `${BASE_URL}/category/${id}`,
    GET_ALL_PRODUCTS: (storeId: string) => `${BASE_URL}/product/store/${storeId}`,
    GET_PRODUCT_BY_ID: (id: string) => `${BASE_URL}/product/id/${id}`,
    CREATE_PRODUCT: `${BASE_URL}/product`,
    UPDATE_PRODUCT: (id: string) => `${BASE_URL}/product/${id}`,
    DELETE_PRODUCT: (id: string) => `${BASE_URL}/product/${id}`,
    GET_ALL_STORES: `${BASE_URL}/store`,
    GET_STORE_BY_ID: (id: string) => `${BASE_URL}/store/${id}`,
    CREATE_STORE: `${BASE_URL}/store`,
    UPDATE_STORE: (id: string) => `${BASE_URL}/store/${id}`,
    DELETE_STORE: (id: string) => `${BASE_URL}/store/${id}`,
    GET_STORE_ORDERS: (storeId: string) => `${BASE_URL}/order/store/${storeId}`,
    GET_ORDER_BY_ID: (id: string) => `${BASE_URL}/order/${id}`,
    CANCEL_ORDER: (id: string) => `${BASE_URL}/order/${id}`,
}