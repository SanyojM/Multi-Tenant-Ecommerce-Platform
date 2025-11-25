import { GetServerSideProps } from 'next';
import { useState } from 'react';
import axios from 'axios';
import Header from '../../components/shared/header';
import { Button } from '@heroui/button';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/router';
import { Minus, Plus } from 'lucide-react';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const host = context.req?.headers?.host;
  
  try {
    const storeResponse = await axios.get(`http://localhost:3003/store/domain/${host}`);
    const store = storeResponse.data;
    
    const productResponse = await axios.get(`http://localhost:3003/product/${id}`);
    const product = productResponse.data;
    
    return {
      props: { store, product },
    };
  } catch (error) {
    return { notFound: true };
  }
};

export default function ProductDetailPage({ store, product }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    
    try {
      await addToCart(product.id, quantity);
      alert('Product added to cart!');
      setQuantity(1);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    
    try {
      await addToCart(product.id, quantity);
      router.push('/cart');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to proceed');
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <>
      <Header store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {product.imageGallery && product.imageGallery.length > 0 ? (
                <img
                  src={product.imageGallery[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            
            {product.imageGallery && product.imageGallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.imageGallery.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-blue-600">
                ${product.price}
              </span>
              {product.stock > 0 ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  Out of Stock
                </span>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            {product.specs && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Specifications</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {Object.entries(JSON.parse(product.specs)).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2 last:border-b-0">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="text-gray-700">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Quantity</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                color="primary"
                size="lg"
                fullWidth
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                color="secondary"
                size="lg"
                fullWidth
                disabled={product.stock === 0}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Category */}
            {product.category && (
              <div className="mt-6">
                <span className="text-sm text-gray-600">
                  Category: <span className="font-medium">{product.category.name}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Graphics */}
        {product.graphics && product.graphics.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.graphics.map((graphic: string, index: number) => (
                <img
                  key={index}
                  src={graphic}
                  alt={`Product detail ${index + 1}`}
                  className="w-full rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
