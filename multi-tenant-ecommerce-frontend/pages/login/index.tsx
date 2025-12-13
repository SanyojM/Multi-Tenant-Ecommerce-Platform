import { GetServerSideProps } from 'next';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import * as api from '../../lib/api';

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

export default function LoginPage({ store }: any) {
  const router = useRouter();
  const { login } = useAuthStore();
  const { setUserId } = useCartStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await api.loginUser({
          email: formData.email,
          password: formData.password,
          storeId: store.id,
        });
        
        login(response.user);
        setUserId(response.user.id);
        alert('Login successful!');
        router.push('/');
      } else {
        // Register
        const response = await api.registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          storeId: store.id,
        });
        
        login(response.user);
        setUserId(response.user.id);
        alert('Registration successful!');
        router.push('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-12 mx-auto mb-4" />
            ) : (
              <h1 className="text-3xl font-bold text-blue-600 mb-4">{store.name}</h1>
            )}
          </Link>
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Login to your account' : 'Sign up to get started'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required={!isLogin}
                  fullWidth
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                fullWidth
              />
            </div>

            <Button
              type="submit"
              color="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '' });
              }}
              className="text-blue-600 hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
