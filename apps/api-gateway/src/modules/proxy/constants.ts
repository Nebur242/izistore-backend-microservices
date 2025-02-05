export const publicRoutes = {
  auth: [
    { path: '/test-helpers/user/register', method: 'POST' },
    { path: '/test-helpers/user/login', method: 'POST' },
  ],
  // Add other services' public routes
} as const;

export const adminRoutes = {
  auth: [
    { path: '/admin/tenants', method: 'GET' },
    { path: '/admin/users', method: 'GET' },
  ],
  // Add other admin routes
} as const;
