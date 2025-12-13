# Admin Panel Authentication Guide

## Overview

The admin panel now has role-based authentication with two types of users:
1. **Super Admin** - Full access to all stores, can manage everything
2. **Store Owner** - Limited access to their assigned store only

## Features

### Super Admin
- Can view and manage all stores
- Can switch between stores using store selector
- Has access to store onboarding/creation page
- Full access to all features

### Store Owner
- Automatically logged into their assigned store
- Cannot see or switch stores
- Cannot access store onboarding page
- Can only manage categories, products, orders, etc. for their store

## Setup Instructions

### 1. Run Database Migration

First, apply the schema changes to your database:

```bash
cd multi-tenant-ecommerce-backend
npx prisma migrate dev --name add_admin_authentication
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Create Admin Users

#### Create a Super Admin

```bash
npm run create-admin
```

Follow the prompts:
- Email: admin@example.com
- Password: your-secure-password
- Name: Admin Name (optional)
- Role: 1 (for SUPER_ADMIN)

#### Create a Store Owner

First, make sure you have stores created in your database. Then:

```bash
npm run create-admin
```

Follow the prompts:
- Email: owner@store.com
- Password: store-owner-password
- Name: Store Owner Name (optional)
- Role: 2 (for STORE_OWNER)
- Select the store number from the list

**Note:** Each store can only have ONE store owner.

### 4. Environment Variables

Make sure you have the API URL configured in your admin panel:

```env
# multi-tenant-ecommerce-admin-panel/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5. Start the Applications

```bash
# Backend
cd multi-tenant-ecommerce-backend
npm run start:dev

# Admin Panel
cd multi-tenant-ecommerce-admin-panel
npm run dev
```

## API Endpoints

### Admin Authentication

#### POST `/auth/admin/login`
Login as admin user

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "admin": {
    "id": "admin-id",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "SUPER_ADMIN",
    "storeId": null,
    "store": null
  },
  "message": "Login successful"
}
```

#### POST `/auth/admin/create`
Create a new admin user

**Request:**
```json
{
  "email": "newadmin@example.com",
  "password": "password123",
  "name": "New Admin",
  "role": "STORE_OWNER",
  "storeId": "store-id-here"
}
```

#### GET `/auth/admin/validate/:adminId`
Validate and get admin details

#### GET `/auth/admin/stores`
Get all stores (for super admins to populate store selector)

## Database Schema

### StoreAdmin Model

```prisma
model StoreAdmin {
  id        String         @id @default(cuid())
  email     String         @unique
  password  String
  name      String?
  role      AdminRole      @default(STORE_OWNER)
  storeId   String?
  
  store     Store?         @relation(fields: [storeId], references: [id])
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

enum AdminRole {
  SUPER_ADMIN
  STORE_OWNER
}
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **Authentication State**: Admin authentication state is persisted in local storage
3. **Protected Routes**: Unauthenticated users are automatically redirected to login page
4. **Role-Based Access**: UI elements are conditionally rendered based on user role

## Usage

### Login Flow

1. Navigate to `/login` in the admin panel
2. Enter admin credentials
3. Click "Sign In"
4. Redirected to dashboard with appropriate access level

### For Super Admins

- Use the store selector at the top to switch between stores
- All management features are available
- Can create new stores from the Stores page

### For Store Owners

- Automatically logged into their assigned store
- Store name displayed at the top (no selector)
- Cannot access stores management page
- Can manage categories, products, orders, etc. for their store

## Troubleshooting

### Can't Login

1. Check if the backend is running
2. Verify database connection
3. Ensure admin user exists in database
4. Check browser console for errors

### Store Owner Sees Wrong Store

Clear browser local storage and login again:
```javascript
localStorage.clear()
```

### Create Admin Script Fails

1. Ensure database is running
2. Run `npx prisma generate` to update Prisma client
3. Check if email already exists in database

## Manual Admin Creation (SQL)

If the script doesn't work, you can create an admin manually:

```sql
-- Create a super admin (password: 'admin123')
INSERT INTO "StoreAdmin" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$rVK8qKvQH8bF8rJKFmfgL.5QKH5CK5pKH5CK5pKH5CK5pKH5CK5pK',
  'Super Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);

-- Note: The password hash above is for 'admin123'
-- Generate your own hash using bcrypt with 10 rounds
```

## Testing

1. Create a super admin user
2. Create a test store
3. Create a store owner for that store
4. Test login with both accounts
5. Verify role-based UI differences

## Next Steps

Consider implementing:
- Password reset functionality
- Email verification
- Two-factor authentication
- Activity logging
- Session management with JWT tokens
- Admin user management UI (CRUD operations)
