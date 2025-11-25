import { GetServerSideProps } from 'next';
import { useState } from 'react';
import axios from 'axios';
import Header from '../../components/shared/header';
import Link from 'next/link';
import { Button } from '@heroui/button';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req?.headers?.host;
  try {
    const storeResponse = await axios.get(`http://localhost:3003/store/domain/${host}`);
    const store = storeResponse.data;
    
    const productsResponse = await axios.get(`http://localhost:3003/product/store/${store.id}`);
    const products = productsResponse.data;
    
    const categoriesResponse = await axios.get(`http://localhost:3003/category/${store.id}`);
    const categories = categoriesResponse.data;
    
    return {
      props: { store, products, categories },
    };
  } catch (error) {
    return { props: { store: null, products: [], categories: [] } };
  }
};

export default function ProductsPage({ store, products: initialProducts, categories }: any) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const filterByCategory = async (categoryId: string | null) => {
    setLoading(true);
    setSelectedCategory(categoryId);
    
    try {
      if (categoryId) {
        const response = await axios.get(`http://localhost:3003/product/category/${categoryId}`);
        setProducts(response.data);
      } else {
        const response = await axios.get(`http://localhost:3003/product/store/${store.id}`);
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error filtering products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated || !user) {
      alert('Please login to add items to cart');
      return;
    }
    
    try {
      await addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <>
      <Header store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">All Products</h1>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'solid' : 'flat'}
              onClick={() => filterByCategory(null)}
              color="primary"
            >
              All Products
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'solid' : 'flat'}
                onClick={() => filterByCategory(category.id)}
                color="primary"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-square bg-gray-100 cursor-pointer">
                    {product.imageGallery && product.imageGallery.length > 0 ? (
                      <img
                        src={product.imageGallery[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-sm text-green-600">In Stock</span>
                    ) : (
                      <span className="text-sm text-red-600">Out of Stock</span>
                    )}
                  </div>
                  <Button
                    fullWidth
                    color="primary"
                    disabled={product.stock === 0}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
