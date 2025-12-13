# Admin Panel Authentication - Quick Start

## ✅ Setup Complete!

The admin panel now has role-based authentication with:
- **Super Admin**: Full access to all stores
- **Store Owner**: Access only to their assigned store

## 🔑 Test Credentials

A super admin has been created for testing:
- **Email**: admin@example.com
- **Password**: admin123

## 🚀 How to Start

### 1. Start Backend
```bash
cd multi-tenant-ecommerce-backend
npm run start:dev
```

### 2. Start Admin Panel
```bash
cd multi-tenant-ecommerce-admin-panel
npm run dev
```

### 3. Login
- Navigate to: http://localhost:3001/login (or your admin panel URL)
- Use the test credentials above
- You'll be redirected to the dashboard

## 👥 Creating Additional Users

### Create Store Owner
1. First, create a store in your database or via the admin panel
2. Run the create-admin script:
```bash
cd multi-tenant-ecommerce-backend
npm run create-admin
```
3. Follow prompts:
   - Enter email and password
   - Choose role: 2 (STORE_OWNER)
   - Select the store from the list

### Create Another Super Admin
```bash
cd multi-tenant-ecommerce-backend
npm run create-admin
```
- Choose role: 1 (SUPER_ADMIN)
- No store assignment needed

## 📋 Key Differences

### Super Admin
- ✅ Sees store selector dropdown
- ✅ Can access /stores page
- ✅ Can create new stores
- ✅ Can switch between stores
- ✅ Full access to all features

### Store Owner
- ❌ No store selector (auto-selected)
- ❌ Cannot access /stores page
- ✅ Store name displayed at top
- ✅ Can manage only their store's:
  - Categories
  - Products
  - Orders
  - Users
  - Website settings
  - Personalization

## 🔐 API Endpoints

- `POST /auth/admin/login` - Login
- `POST /auth/admin/create` - Create admin (can be called from API)
- `GET /auth/admin/validate/:adminId` - Validate admin session
- `GET /auth/admin/stores` - Get all stores (for super admin)

## 🛠️ Database Schema

New tables added:
- `StoreAdmin` - Stores admin user credentials
- `AdminRole` enum - SUPER_ADMIN | STORE_OWNER

## ⚡ Next Steps

1. Test login with the super admin account
2. Create a test store (if not exists)
3. Create a store owner for that store
4. Test login as store owner to verify restricted access
5. Customize the login page styling if needed
6. Consider adding password reset functionality
7. Add environment variable for API URL in admin panel

## 📝 Environment Variables

Make sure to set in admin panel `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Replace with your actual backend URL.
