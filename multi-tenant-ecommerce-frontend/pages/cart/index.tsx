import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/shared/header';
import { Button } from '@heroui/button';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/router';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req?.headers?.host;
  try {
    const storeResponse = await axios.get(`http://localhost:3003/store/domain/${host}`);
    const store = storeResponse.data;
    return { props: { store } };
  } catch (error) {
    return { props: { store: null } };
  }
};

export default function CartPage({ store }: any) {
  const router = useRouter();
  const { items, fetchCartItems, updateQuantity, removeItem, getTotal, loading } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    fetchCartItems();
  }, [isAuthenticated, user, fetchCartItems, router]);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    setUpdating(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (confirm('Remove this item from cart?')) {
      await removeItem(cartItemId);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const total = getTotal();

  return (
    <>
      <Header store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {loading && items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button color="primary">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                  {/* Product Image */}
                  <Link href={`/product/${item.product.id}`}>
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                      {item.product.imageGallery && item.product.imageGallery.length > 0 ? (
                        <img
                          src={item.product.imageGallery[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link href={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 cursor-pointer">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">{item.product.category.name}</p>
                    <p className="text-lg font-bold text-blue-600">${item.product.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating === item.id}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock || updating === item.id}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-lg font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  color="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  className="mb-3"
                >
                  Proceed to Checkout
                </Button>

                <Link href="/products">
                  <Button variant="flat" fullWidth>
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
