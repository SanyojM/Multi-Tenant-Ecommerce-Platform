import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/shared/header';
import { Button } from '@heroui/button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req?.headers?.host;
  const { orderId } = context.query;
  
  try {
    const storeResponse = await axios.get(`http://localhost:4004/store/domain/${host}`);
    const store = storeResponse.data;
    
    if (orderId) {
      const orderResponse = await axios.get(`http://localhost:4004/order/${orderId}`);
      const order = orderResponse.data;
      return { props: { store, order } };
    }
    
    return { props: { store, order: null } };
  } catch (error) {
    return { props: { store: null, order: null } };
  }
};

export default function OrderSuccessPage({ store, order }: any) {
  const router = useRouter();

  if (!order) {
    return (
      <>
        <Header store={store} />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-gray-600">Order not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header store={store} />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-blue-600">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">{order.payment?.method || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {order.address && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-700">
                  {order.address.fullName}<br />
                  {order.address.addressLine1}<br />
                  {order.address.addressLine2 && <>{order.address.addressLine2}<br /></>}
                  {order.address.city}, {order.address.state} - {order.address.pincode}<br />
                  Phone: {order.address.phone}
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-2">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/orders">
              <Button color="primary" size="lg">
                View Orders
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="flat" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
