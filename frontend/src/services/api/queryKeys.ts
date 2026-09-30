export const queryKeys = {
  health: ['health-check'] as const,
  auth: {
    user: ['auth', 'user'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters?: Record<string, unknown>) => ['products', 'list', filters] as const,
    detail: (id: number | string) => ['products', 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  cart: ['cart'] as const,
  addresses: ['addresses'] as const,
  orders: {
    all: ['orders'] as const,
    detail: (id: number | string) => ['orders', 'detail', id] as const,
  },
  reviews: {
    byProduct: (productId: number | string, page?: number) => ['reviews', 'product', productId, page] as const,
    summary: (productId: number | string) => ['reviews', 'summary', productId] as const,
  },
  coupons: ['coupons'] as const,
  admin: {
    stats: ['admin', 'stats'] as const,
    products: ['admin', 'products'] as const,
    orders: ['admin', 'orders'] as const,
    users: ['admin', 'users'] as const,
  },
};
