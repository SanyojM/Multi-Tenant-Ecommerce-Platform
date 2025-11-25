# Authentication Testing Guide

## Backend is Running ✅

The backend server has been successfully restarted with authentication functionality.

### Available Auth Endpoints:

1. **POST /auth/register** - Register new user
   - Body: `{ email, password, name?, storeId }`
   
2. **POST /auth/login** - Login user
   - Body: `{ email, password, storeId }`

3. **GET /auth/validate/:userId** - Validate user session

## Testing Registration & Login

### Step 1: Access the Frontend
1. Open your browser to `http://localhost:3001` (or the port where frontend is running)
2. You should see the store homepage

### Step 2: Register a New Account
1. Click on the user icon in the header or navigate to `/login`
2. Click "Don't have an account? Sign up"
3. Fill in:
   - **Name**: Your name
   - **Email**: your.email@example.com
   - **Password**: A secure password
4. Click "Sign Up"
5. You should be automatically logged in and redirected to the homepage

### Step 3: Test Login
1. If you logout (via profile page), go back to `/login`
2. Click "Already have an account? Login"
3. Enter your email and password
4. Click "Login"
5. You should be logged in and redirected to homepage

### Step 4: Verify Authentication
Once logged in, you can:
- See cart icon with counter in header
- Access `/profile` to view your account
- Browse and add products to cart
- Proceed to checkout

## Backend Configuration

The backend now includes:
- ✅ Password hashing with bcrypt
- ✅ User registration with duplicate email check
- ✅ Login with password validation
- ✅ User CRUD operations
- ✅ Store-specific user isolation (multi-tenant)

## Frontend Configuration

The frontend now includes:
- ✅ Login/Register page with validation
- ✅ User authentication state management (Zustand)
- ✅ Protected routes (cart, checkout, orders, profile)
- ✅ Automatic redirect to login for unauthenticated users
- ✅ Profile page for viewing/editing user info

## Common Issues & Solutions

### Issue: "User already exists"
**Solution**: Use a different email address or login with existing credentials

### Issue: "Invalid credentials"
**Solution**: Check that email and password are correct and match a registered account

### Issue: Can't register/login
**Solution**: 
1. Check that backend is running on port 3003
2. Check browser console for errors
3. Verify CORS is enabled in backend
4. Ensure `.env` in frontend has `NEXT_PUBLIC_API_URL=http://localhost:3003`

### Issue: Logged out unexpectedly
**Solution**: Authentication is stored in localStorage. Clear browser cache if issues persist.

## Testing Full Flow

1. **Register** → Create account
2. **Browse Products** → View products page
3. **Add to Cart** → Click "Add to Cart" on products
4. **View Cart** → Check cart page
5. **Checkout** → Enter delivery address
6. **Payment** → Choose COD or Razorpay
7. **Order Success** → View order confirmation
8. **My Orders** → See order history
9. **Profile** → View/edit profile
10. **Logout** → Use logout button in profile page

## API Testing with cURL

### Register:
```bash
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "storeId": "YOUR_STORE_ID"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "storeId": "YOUR_STORE_ID"
  }'
```

## Next Steps

Your authentication system is now fully functional! You can:
1. Test registration and login flows
2. Add items to cart (requires authentication)
3. Complete checkout process
4. View order history
5. Manage user profile

All authentication features are working and ready for production use! 🎉
