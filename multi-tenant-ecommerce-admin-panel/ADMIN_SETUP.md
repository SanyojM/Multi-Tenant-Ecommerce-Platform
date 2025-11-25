# Multi-Tenant E-Commerce Admin Panel Setup

## Overview
This admin panel allows you to manage multiple stores, their products, categories, and orders from a single interface.

## Features Implemented

### 1. Store Management
- **Create Stores**: Add new stores with name and domain
- **View All Stores**: See all stores with their status and domains
- **Edit Stores**: Update store details
- **Delete Stores**: Remove stores (also deletes associated products and categories)
- **Store Status**: Track domain verification status (PENDING/ACTIVE/INACTIVE)

### 2. Store Selector
- **Navbar Dropdown**: Select active store from the top navbar
- **Auto-Selection**: Automatically selects the first store on load
- **Persistent Selection**: Selected store is saved in localStorage
- **Context Awareness**: All pages are aware of the selected store

### 3. Product Management
- **Create Products**: Add products with images, graphics, specs
- **View Products**: See all products for selected store
- **Edit Products**: Update product details
- **Delete Products**: Remove products
- **Category Assignment**: Assign products to categories
- **Stock Management**: Track and update product stock

### 4. Category Management
- **Create Categories**: Add categories with images
- **View Categories**: See all categories for selected store
- **Edit Categories**: Update category details
- **Delete Categories**: Remove categories

### 5. Order Management
- **View Orders**: See all orders for selected store
- **Order Details**: View complete order information including:
  - Customer details
  - Delivery address
  - Payment information
  - Order items with quantities and prices
- **Cancel Orders**: Cancel orders and restore product stock
- **Order Status**: Track payment status (SUCCESS/PENDING/FAILED)

## How to Use

### Initial Setup

1. **Start the Backend**:
   ```bash
   cd multi-tenant-ecommerce-backend
   npm run start:dev
   ```

2. **Start the Admin Panel**:
   ```bash
   cd multi-tenant-ecommerce-admin-panel
   npm run dev
   ```

3. **Access Admin Panel**: Open http://localhost:3000 (or the configured port)

### Creating Your First Store

1. Click on the **"Stores"** icon in the sidebar
2. Click **"Add Store"** button
3. Enter:
   - **Store Name**: e.g., "My Fashion Store"
   - **Domain**: e.g., "localhost:3001"
4. Click **"Create Store"**
5. The new store will be automatically selected in the navbar

### Managing Products

1. **Select a Store**: Choose your store from the dropdown in the navbar
2. Navigate to **"Products"** from the sidebar
3. Click **"Add Product"** to create a new product:
   - Fill in product details (name, description, price, stock)
   - Select a category
   - Upload product images (multiple allowed)
   - Upload product graphics (optional)
   - Add specifications as key-value pairs
4. Click **"Save"** to create the product

### Managing Categories

1. **Select a Store**: Choose your store from the navbar dropdown
2. Navigate to **"Categories"** from the sidebar
3. Click **"Add Category"**:
   - Enter category name
   - Upload category image
4. Click **"Save"**

### Viewing Orders

1. **Select a Store**: Choose your store from the navbar dropdown
2. Navigate to **"Orders"** from the sidebar
3. View all orders in a table format
4. Click the **eye icon** to view order details
5. Click the **trash icon** to cancel an order (restores stock)

## Store Selection Workflow

```
User Opens Admin Panel
    ↓
Store Selector in Navbar Appears
    ↓
User Selects a Store (or auto-selected)
    ↓
Selected Store Context Applied
    ↓
Products/Categories/Orders Filtered by Store
```

## Important Notes

### Store Context
- **Always select a store** before managing products, categories, or orders
- The selected store is displayed prominently in the navbar
- If no store is selected, you'll see a warning message on product/category/order pages

### Data Isolation
- Each store has its own products, categories, and orders
- Deleting a store will delete all associated data
- Products are tied to categories within the same store

### Permissions
- Currently, all features are accessible without authentication
- Consider implementing role-based access control for production use

## API Endpoints Used

### Store APIs
- `GET /store` - Get all stores
- `POST /store` - Create new store
- `PUT /store/:id` - Update store
- `DELETE /store/:id` - Delete store

### Product APIs
- `GET /product/store/:storeId` - Get products by store
- `POST /product` - Create product
- `PUT /product/:id` - Update product
- `DELETE /product/:id` - Delete product

### Category APIs
- `GET /category/:storeId` - Get categories by store
- `POST /category` - Create category
- `PUT /category/:id` - Update category
- `DELETE /category/:id` - Delete category

### Order APIs
- `GET /order/store/:storeId` - Get orders by store
- `GET /order/:id` - Get order details
- `DELETE /order/:id` - Cancel order

## Troubleshooting

### "Please select a store" Warning
**Solution**: Click the store dropdown in the navbar and select a store

### No stores available
**Solution**: Navigate to the Stores page and create your first store

### Products not showing
**Solution**: Ensure you have:
1. Selected a store from the navbar
2. Created categories for that store
3. Created products assigned to those categories

### Orders not appearing
**Solution**: 
1. Ensure users have placed orders through the frontend
2. Check that the correct store is selected
3. Verify backend is running on port 3003

## Next Steps

### Recommended Enhancements
1. **Authentication**: Add admin login/logout functionality
2. **Role Management**: Implement different permission levels
3. **Analytics**: Add dashboard with sales metrics
4. **Notifications**: Real-time order notifications
5. **Bulk Operations**: Bulk product upload via CSV
6. **Order Status**: Add order status workflow (pending → processing → shipped → delivered)
7. **Customer Management**: View and manage customer details
8. **Reports**: Generate sales and inventory reports

## File Structure

```
src/
├── app/
│   ├── (main)/
│   │   ├── stores/          # Store management page
│   │   ├── products/        # Product management page
│   │   ├── categories/      # Category management page
│   │   ├── orders/          # Order management page
│   │   └── layout.tsx       # Main layout with navbar
│   └── layout.tsx
├── components/
│   ├── wrappers/
│   │   └── LayoutWrapper.tsx  # Sidebar + Store selector
│   ├── product-components/
│   ├── category-components/
│   └── ui/                  # Reusable UI components
├── store/
│   ├── useStoreStore.ts    # Store state management
│   ├── useProductStore.ts  # Product state management
│   ├── useCategoryStore.ts # Category state management
│   └── useOrderStore.ts    # Order state management
└── lib/
    └── urls.ts             # API endpoint configurations
```

## Support
For issues or questions, please check the backend logs and ensure all services are running correctly.
