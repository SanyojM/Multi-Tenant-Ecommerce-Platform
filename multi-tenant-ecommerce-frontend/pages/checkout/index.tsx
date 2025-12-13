import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/shared/header';
import { Button } from '@heroui/button';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/router';
import * as api from '../../lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req?.headers?.host;
  try {
    const storeResponse = await axios.get(`http://localhost:4004/store/domain/${host}`);
    const store = storeResponse.data;
    return { props: { store } };
  } catch (error) {
    return { props: { store: null } };
  }
};

export default function CheckoutPage({ store }: any) {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    addressLine1: '',
    addressLine2: '',
  });

  // Check if Razorpay is configured
  const isRazorpayEnabled = () => {
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    return razorpayKeyId && razorpayKeyId !== 'your_razorpay_key_id_here' && razorpayKeyId.trim() !== '';
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [isAuthenticated, user, items, router]);

  const total = getTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const validateAddress = () => {
    const { fullName, phone, pincode, city, state, addressLine1 } = address;
    if (!fullName || !phone || !pincode || !city || !state || !addressLine1) {
      alert('Please fill in all required address fields');
      return false;
    }
    if (phone.length < 10) {
      alert('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    setLoading(true);
    try {
      // Create address
      const addressResponse = await axios.post('http://localhost:4004/address', {
        userId: user!.id,
        ...address,
      });
      const addressId = addressResponse.data.id;

      // Prepare order items
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      if (paymentMethod === 'COD') {
        // Create order with COD
        const order = await api.createOrder({
          userId: user!.id,
          storeId: store.id,
          items: orderItems,
          addressId,
        });

        // Create payment record
        await api.createPayment(order.id, total, 'COD');

        // Clear cart
        await clearCart();

        // Redirect to success page
        router.push(`/order-success?orderId=${order.id}`);
      } else if (paymentMethod === 'RAZORPAY') {
        // Check if Razorpay is configured
        const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        
        if (!razorpayKeyId || razorpayKeyId === 'your_razorpay_key_id_here') {
          alert('Razorpay payment is not configured. Please use Cash on Delivery or contact support.');
          setLoading(false);
          return;
        }

        // Check if Razorpay script is loaded
        if (!window.Razorpay) {
          alert('Payment gateway is loading. Please try again in a moment.');
          setLoading(false);
          return;
        }

        try {
          // Create Razorpay order
          const razorpayOrder = await api.createRazorpayOrder(total);

          // Initialize Razorpay
          const options = {
            key: razorpayKeyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: store.name,
            description: 'Order Payment',
            order_id: razorpayOrder.id,
            handler: async function (response: any) {
              try {
                // Verify payment
                await api.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                // Create order
                const order = await api.createOrder({
                  userId: user!.id,
                  storeId: store.id,
                  items: orderItems,
                  addressId,
                });

                // Create payment record
                const payment = await api.createPayment(order.id, total, 'UPI');
                await api.updatePaymentStatus(payment.id, 'SUCCESS');

                // Clear cart
                await clearCart();

                // Redirect to success page
                router.push(`/order-success?orderId=${order.id}`);
              } catch (error) {
                console.error('Payment verification failed:', error);
                alert('Payment verification failed. Please contact support.');
              }
            },
            prefill: {
              name: address.fullName,
              contact: address.phone,
            },
            theme: {
              color: '#3B82F6',
            },
            modal: {
              ondismiss: function() {
                setLoading(false);
              }
            }
          };

          const razorpay = new window.Razorpay(options);
          razorpay.on('payment.failed', function (response: any) {
            alert('Payment failed. Please try again.');
            setLoading(false);
          });
          razorpay.open();
        } catch (error: any) {
          console.error('Error creating Razorpay order:', error);
          alert('Failed to initialize payment. Please try Cash on Delivery or contact support.');
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user || items.length === 0) {
    return null;
  }

  return (
    <>
      <Header store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={address.addressLine1}
                    onChange={handleInputChange}
                    placeholder="House No., Building Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={address.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Road name, Area, Colony"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mr-3"
                    aria-label="Cash on Delivery"
                  />
                  <div>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive the product</div>
                  </div>
                </label>
                {isRazorpayEnabled() && (
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="mr-3"
                      aria-label="Online Payment"
                    />
                    <div>
                      <div className="font-semibold">Online Payment</div>
                      <div className="text-sm text-gray-600">UPI, Cards, Net Banking, Wallets</div>
                    </div>
                  </label>
                )}
                {!isRazorpayEnabled() && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Online payment is currently unavailable. Please use Cash on Delivery.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
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
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </>
  );
}
