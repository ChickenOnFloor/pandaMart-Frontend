# PandaMart - Premium Ecommerce Platform

A full-featured ecommerce platform built with Next.js 14, React, TypeScript, and Tailwind CSS. This frontend connects to an Express + MongoDB backend with cookie-based JWT authentication.

## Features

### Public Store (No Authentication Required)
- **Home Page** (`/`) - Hero section with featured products
- **Products Page** (`/products`) - Browsable product catalog with filters:
  - Category filtering
  - Price range selection
  - In-stock filter
  - Search functionality
- **Product Details** (`/products/[id]`) - Detailed product information

### Authentication System
- **Login** (`/login`) - User sign in
- **Register** (`/register`) - New account creation
- JWT authentication via cookies
- Role-based access (user, seller, admin)

### Buyer Features (Authenticated Users)
- **Shopping Cart** (`/cart`) - Server-side cart management
  - Add/remove products
  - View totals
- **Checkout** (`/checkout`) - Order placement
  - Shipping information
  - Order summary
  - Fake payment flow (replace with Stripe/payment processor)

### Seller Dashboard (role: seller)
- **Dashboard** (`/seller/dashboard`) - Overview of products and stats
  - Total products count
  - Approved vs. pending breakdown
- **Products Management** (`/seller/products`) - Full CRUD operations
  - List all seller's products
  - View approval status
  - Delete products
- **Create/Edit Product** (`/seller/products/new`, `/seller/products/[id]/edit`)
  - Form validation
  - Product details (name, description, price, stock, category, image URL)
  - Approval status tracking

### Admin Dashboard (role: admin)
- **Dashboard** (`/admin/dashboard`) - System overview
  - User count
  - Product count
  - Pending approvals
- **User Management** (`/admin/users`) - Full user control
  - List all users
  - View user details (`/admin/users/[id]`)
  - Change user roles
  - Delete users
  - View and approve user's products
  - Manage product approvals
- **Product Management** (`/admin/products`) - Product approval workflow
  - View all products
  - Filter by status
  - Approve pending products
  - Delete products

## Project Structure

```
app/
├── page.tsx                    # Home page
├── login/page.tsx              # Login page
├── register/page.tsx           # Register page
├── products/
│   ├── page.tsx               # Products listing
│   └── [id]/page.tsx          # Product details
├── cart/page.tsx              # Shopping cart (protected)
├── checkout/page.tsx          # Checkout (protected)
├── seller/
│   ├── dashboard/page.tsx     # Seller dashboard
│   └── products/
│       ├── page.tsx           # Seller's products
│       ├── new/page.tsx       # Create product
│       └── [id]/edit/page.tsx # Edit product
└── admin/
    ├── dashboard/page.tsx     # Admin dashboard
    ├── users/
    │   ├── page.tsx           # User list
    │   └── [id]/page.tsx      # User details
    └── products/page.tsx      # Product management

lib/
├── auth-context.tsx           # Global auth state
├── toast-context.tsx          # Toast notifications
├── api.ts                      # API utilities with auth

components/
├── header.tsx                 # Navigation header
├── confirm-modal.tsx          # Delete confirmation
├── empty-state.tsx            # Empty state UI
├── skeletons.tsx              # Loading skeletons
└── ui/                        # shadcn/ui components

middleware.ts                   # Route protection
```

## API Integration

The app uses cookie-based JWT authentication. All API calls include credentials:

```typescript
await fetch('/api/endpoint', {
  credentials: 'include',  // Includes JWT cookie
  // ...
})
```

### Key API Endpoints

**Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

**Products:**
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Product details
- `POST /api/seller/products` - Create product
- `PUT /api/seller/products/:id` - Update product
- `DELETE /api/seller/products/:id` - Delete product
- `GET /api/admin/products` - List all products (admin)
- `PATCH /api/admin/products/:id/approve` - Approve product
- `DELETE /api/admin/products/:id` - Delete product (admin)

**Cart:**
- `GET /api/cart` - Get cart contents
- `POST /api/cart/add` - Add to cart
- `DELETE /api/cart/remove/:productId` - Remove from cart
- `POST /api/orders/checkout` - Place order

**Admin:**
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - User details
- `PATCH /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT in HTTP-only cookie
3. `useAuth()` hook calls `GET /api/auth/me` on app load
4. User state is stored in `AuthContext`
5. Protected routes redirect unauthenticated users to `/login`
6. All API calls automatically include the JWT cookie

## Route Protection

- **Middleware** (`middleware.ts`) protects routes before they load
- Protected routes: `/cart`, `/checkout`, `/seller/*`, `/admin/*`
- Already authenticated users can't access `/login` or `/register`
- 401/403 errors redirect to login

## State Management

- **Auth State:** `AuthContext` with `useAuth()` hook
- **Cart:** Server-side only (no localStorage)
- **Notifications:** `ToastContext` with `useToast()` hook

## UI Components

- **shadcn/ui**: Pre-built, accessible components
- **Tailwind CSS**: Utility-first styling
- **Responsive Design:** Mobile-first approach
- **Loading States:** Skeleton screens for better UX
- **Empty States:** User-friendly placeholders
- **Toasts:** Notification system
- **Modals:** Confirmation dialogs

## Environment Variables

No environment variables needed for this frontend. All API calls are relative to the current domain.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Backend Setup

This frontend requires an Express + MongoDB backend. The app will show sample data if the backend isn't available, but full functionality requires the API server running.

**To set up the backend:**
1. Create a separate Express.js server repository
2. Connect to MongoDB database
3. Implement the API endpoints listed in the "API Integration" section above
4. Run the backend server (typically on `http://localhost:5000`)
5. Configure CORS to allow requests from your frontend domain

The frontend expects the backend to handle:
- JWT authentication via HTTP-only cookies
- Product CRUD operations
- User role management
- Cart and order management
- Product approval workflow

If the backend is not running, you'll see a yellow notice on the home page suggesting to start the backend server. The app will gracefully handle connection errors and show fallback UI.

## Production Checklist

- [ ] Replace fake checkout with real payment processor (Stripe)
- [ ] Add proper error handling and logging
- [ ] Implement CSRF protection if needed
- [ ] Add rate limiting
- [ ] Setup proper CORS
- [ ] Add image optimization
- [ ] Implement proper analytics
- [ ] Add security headers
- [ ] Setup monitoring and alerts

## Notes

- **No localStorage:** Cart is server-side only for data consistency
- **Guest checkout disabled:** Guests must create account to checkout
- **Admin approval workflow:** Sellers' products need admin approval before appearing
- **Fake checkout:** Payment form is non-functional for demo purposes
