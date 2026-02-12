import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Get base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    credentials: 'include', // This ensures cookies are sent with requests
    prepareHeaders: (headers, { getState }) => {
      // You could add authorization headers here if using Bearer tokens
      // For cookie-based auth, credentials: 'include' handles it
      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Cart', 'Order', 'Admin'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    // Product endpoints
    getProducts: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return `/public/products?${queryParams}`; // Changed to public route
      },
      providesTags: ['Product'],
    }),
    getProductById: builder.query({
      query: (id) => `/public/products/${id}`, // Changed to public route
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    
    // Cart endpoints
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (cartItem) => ({
        url: '/cart/add',
        method: 'POST',
        body: cartItem,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCart: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: '/cart/update',
        method: 'PUT',
        body: { productId, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/cart/remove/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    
    // Order endpoints
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    
    // Admin endpoints
    getUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    getAdminProducts: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return `/admin/products?${queryParams}`;
      },
      providesTags: ['Product'],
    }),
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Admin'],
    }),
    approveProduct: builder.mutation({
      query: (productId) => ({
        url: `/admin/products/${productId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Product', 'Admin'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Admin'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Seller endpoints
    getSellerProducts: builder.query({
      query: () => '/seller/products',
      providesTags: ['Product'],
    }),
    createSellerProduct: builder.mutation({
      query: (productData) => ({
        url: '/seller/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),
    updateSellerProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/seller/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteSellerProduct: builder.mutation({
      query: (id) => ({
        url: `/seller/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  
  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,
  
  // Cart
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  
  // Orders
  useGetOrdersQuery,
  useCreateOrderMutation,
  
  // Admin
  useGetUsersQuery,
  useGetAdminProductsQuery,
  useGetAdminStatsQuery,
  useApproveProductMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  
  // Seller
  useGetSellerProductsQuery,
  useCreateSellerProductMutation,
  useUpdateSellerProductMutation,
  useDeleteSellerProductMutation,
} = api;