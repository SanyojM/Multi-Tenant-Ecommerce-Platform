import { GetServerSideProps } from 'next';
import axios from 'axios';
import Header from '../../components/shared/header';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req?.headers?.host;
  try {
    const storeResponse = await axios.get(`http://localhost:3003/store/domain/${host}`);
    const store = storeResponse.data;
    
    const categoriesResponse = await axios.get(`http://localhost:3003/category/${store.id}`);
    const categories = categoriesResponse.data;
    
    return { props: { store, categories } };
  } catch (error) {
    return { props: { store: null, categories: [] } };
  }
};

export default function CategoriesPage({ store, categories }: any) {
  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <>
      <Header store={store} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">All Categories</h1>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category: any) => (
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
        )}
      </main>
    </>
  );
}
