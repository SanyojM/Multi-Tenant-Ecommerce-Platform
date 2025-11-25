# Multi-Tenant E-commerce Platform - Complete Setup Guide

This is a comprehensive multi-tenant e-commerce platform with separate admin panel and user-facing frontend.

## Project Structure

- **multi-tenant-ecommerce-backend**: NestJS backend API
- **multi-tenant-ecommerce-admin-panel**: Next.js admin panel for store management
- **multi-tenant-ecommerce-frontend**: Next.js customer-facing store

## Features Implemented

### Backend Features
- ✅ Multi-tenant store management
- ✅ Product & Category management with image uploads
- ✅ Shopping cart functionality
- ✅ Order management system
- ✅ Payment integration (Razorpay & COD)
- ✅ User authentication & authorization
- ✅ Address management
- ✅ Product search functionality
- ✅ Image storage with Supabase

### Admin Panel Features
- ✅ Store dashboard
- ✅ Product management (CRUD operations)
- ✅ Category management with images
- ✅ Order tracking
- ✅ User management
- ✅ Multi-image upload for products
- ✅ Product specifications editor

### User Frontend Features
- ✅ Product browsing & search
- ✅ Category-based filtering
- ✅ Shopping cart with quantity management
- ✅ Checkout process with address management
- ✅ Multiple payment methods (COD & Razorpay)
- ✅ Order tracking
- ✅ User authentication (login/register)
- ✅ Responsive design

## Setup Instructions

### 1. Backend Setup

```bash
cd multi-tenant-ecommerce-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure .env file with:
# - Database URL (PostgreSQL)
# - Supabase credentials
# - Razorpay keys (optional)
# - VPS IP (for domain verification)

# Run Prisma migrations
npx prisma migrate dev

# Start the backend server
npm run start:dev
```

The backend will run on `http://localhost:3003`

### 2. Admin Panel Setup

```bash
cd multi-tenant-ecommerce-admin-panel

# Install dependencies
npm install

# Start the admin panel
npm run dev
```

The admin panel will run on `http://localhost:3000`

### 3. User Frontend Setup

```bash
cd multi-tenant-ecommerce-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure .env.local with:
# - NEXT_PUBLIC_API_URL=http://localhost:3003
# - NEXT_PUBLIC_RAZORPAY_KEY_ID (if using Razorpay)

# Start the frontend
npm run dev
```

The user frontend will run on `http://localhost:3001` (or next available port)

## Payment Gateway Setup (Optional)

### Razorpay Integration

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from the dashboard
3. Add to backend `.env`:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
4. Add to frontend `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
   ```

## Database Schema

The platform uses PostgreSQL with the following main models:
- Store
- User
- Category
- Product
- CartItem
- Order
- OrderItem
- Payment
- Address

## API Endpoints

### Store Management
- `GET /store/:id` - Get store by ID
- `GET /store/domain/:domain` - Get store by domain
- `POST /store` - Create store
- `PUT /store/:id` - Update store
- `DELETE /store/:id` - Delete store

### Product Management
- `GET /product/store/:storeId` - Get all products for a store
- `GET /product/:id` - Get product by ID
- `GET /product/category/:categoryId` - Get products by category
- `GET /product/search/:storeId?q=query` - Search products
- `POST /product` - Create product (with image upload)
- `PUT /product/:id` - Update product
- `DELETE /product/:id` - Delete product

### Category Management
- `GET /category/:storeId` - Get all categories for a store
- `GET /category/id/:id` - Get category by ID
- `POST /category` - Create category (with image upload)
- `PUT /category/:id` - Update category
- `DELETE /category/:id` - Delete category

### Cart Management
- `POST /cart/add` - Add item to cart
- `GET /cart/:userId` - Get user's cart
- `GET /cart/:userId/total` - Get cart total
- `PATCH /cart/:cartItemId` - Update cart item quantity
- `DELETE /cart/:cartItemId` - Remove item from cart
- `DELETE /cart/clear/:userId` - Clear cart

### Order Management
- `POST /order` - Create order
- `GET /order/:id` - Get order by ID
- `GET /order/user/:userId` - Get user's orders
- `GET /order/store/:storeId` - Get store's orders
- `DELETE /order/:id` - Cancel order

### Payment Management
- `POST /payment` - Create payment record
- `POST /payment/razorpay/create-order` - Create Razorpay order
- `POST /payment/razorpay/verify` - Verify Razorpay payment
- `PATCH /payment/:id/status` - Update payment status
- `GET /payment/:id` - Get payment by ID
- `GET /payment/order/:orderId` - Get payment by order ID

### Address Management
- `POST /address` - Create address
- `GET /address/user/:userId` - Get user's addresses
- `GET /address/:id` - Get address by ID
- `PATCH /address/:id` - Update address
- `DELETE /address/:id` - Delete address

## Usage Flow

### For Store Admin:
1. Access admin panel at the store's domain
2. Login with admin credentials
3. Manage products, categories, and orders
4. Upload product images and graphics
5. Track customer orders

### For Customers:
1. Visit the store's domain
2. Browse products by category
3. Search for specific products
4. Add items to cart
5. Create account or login
6. Proceed to checkout
7. Enter delivery address
8. Choose payment method (COD or Razorpay)
9. Place order
10. Track order status

## Key Features

### Multi-Image Upload
- Products support multiple images in gallery
- Separate graphics/detail images
- Image preview before upload
- Remove existing images during edit

### Product Specifications
- Dynamic key-value pairs
- Add/remove specifications
- Display on product detail page

### Payment Options
- **Cash on Delivery (COD)**: Default option, no setup required
- **Razorpay**: Online payments via UPI, cards, net banking, wallets

### Responsive Design
- Mobile-friendly interface
- Optimized for all screen sizes
- Touch-friendly interactions

## Troubleshooting

### Backend Issues
- Ensure PostgreSQL is running
- Check Supabase credentials
- Verify all environment variables

### Frontend Issues
- Clear browser cache
- Check API URL in environment variables
- Ensure backend is running

### Payment Issues
- Verify Razorpay credentials
- Check if payment gateway is enabled
- Test with test mode keys first

## Security Notes

- Never commit `.env` files
- Use environment variables for sensitive data
- Implement proper authentication for admin routes
- Validate all user inputs on backend
- Use HTTPS in production

## Next Steps

1. Add email notifications for orders
2. Implement review/rating system
3. Add wishlist functionality
4. Create admin analytics dashboard
5. Add multi-language support
6. Implement discount/coupon system

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
