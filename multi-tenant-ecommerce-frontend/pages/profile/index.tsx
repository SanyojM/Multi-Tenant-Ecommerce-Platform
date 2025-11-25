import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/shared/header';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User as UserIcon, ShoppingBag, MapPin, LogOut } from 'lucide-react';

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

export default function ProfilePage({ store }: any) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`http://localhost:3003/user/${user!.id}`, formData);
      alert('Profile updated successfully!');
      setEditing(false);
      // Update user in store
      const response = await axios.get(`http://localhost:3003/user/${user!.id}`);
      useAuthStore.getState().setUser(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header store={store} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Personal Information</h2>
                {!editing ? (
                  <Button
                    variant="flat"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      variant="flat"
                      size="sm"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  {editing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      fullWidth
                    />
                  ) : (
                    <p className="text-lg">{user.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  {editing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      fullWidth
                    />
                  ) : (
                    <p className="text-lg">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Account ID</label>
                  <p className="text-sm text-gray-600">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/orders">
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    <span>My Orders</span>
                  </button>
                </Link>
                <Link href="/cart">
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    <span>Shopping Cart</span>
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-left text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-blue-900">Account Status</h3>
              <p className="text-sm text-blue-800">
                {user.isAdmin ? 'Admin Account' : 'Customer Account'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
