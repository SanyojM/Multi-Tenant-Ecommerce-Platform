import Header from "../components/shared/header";
import axios from "axios";  
import { GetServerSideProps } from "next";
import Link from "next/link";
import { Button } from "@heroui/button";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req?.headers?.host;
  try {
    const storeResponse = await axios.get(`http://localhost:3003/store/domain/${host}`);
    const storeData = storeResponse.data;
    
    const categoriesResponse = await axios.get(`http://localhost:3003/category/${storeData.id}`);
    const categories = categoriesResponse.data;
    
    const productsResponse = await axios.get(`http://localhost:3003/product/store/${storeData.id}`);
    const products = productsResponse.data;
    
    return {
      props: { 
        store: storeData,
        categories,
        products: products.slice(0, 8), // Featured products
      },
    };
  } catch (error) {
    return {
      props: {
        store: null,
        categories: [],
        products: [],
      },
    };
  }
}

export default function HomePage({ store, categories, products }: { 
  store: any; 
  categories: any[];
  products: any[];
}) {
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  return (
    <>
      <Header store={store} />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">{store.name}</h1>
            <p className="text-xl mb-8">{store.description || 'Welcome to our store'}</p>
            <Link href="/products">
              <Button size="lg" color="secondary">
                Shop Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <div className="group cursor-pointer">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-center group-hover:text-blue-600">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        {products.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link href="/products">
                <Button variant="flat">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-100">
                      {product.imageGallery && product.imageGallery.length > 0 ? (
                        <img
                          src={product.imageGallery[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">
                          ${product.price}
                        </span>
                        {product.stock > 0 ? (
                          <span className="text-sm text-green-600">In Stock</span>
                        ) : (
                          <span className="text-sm text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
