import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/shared/header';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/router';
import * as api from '../../lib/api';

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

export default function OrdersPage({ store }: any) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await api.getUserOrders(user.id);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">You haven't placed any orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    {order.payment && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.payment.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : order.payment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.payment.status}
                      </span>
                    )}
                  </div>
                </div>

                {order.address && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2 text-sm">Delivery Address</h3>
                    <p className="text-sm text-gray-700">
                      {order.address.fullName}<br />
                      {order.address.addressLine1}, {order.address.addressLine2 && <>{order.address.addressLine2}, </>}
                      {order.address.city}, {order.address.state} - {order.address.pincode}<br />
                      Phone: {order.address.phone}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.payment && (
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold">{order.payment.method}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
