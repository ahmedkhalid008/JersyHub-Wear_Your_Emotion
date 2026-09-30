export type JerseyType = 'HOME' | 'AWAY' | 'THIRD' | 'TRAINING' | 'SPECIAL_EDITION';
export type JerseyAuthenticity = 'AUTHENTIC' | 'REPLICA';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ProductVariant {
  id: string | number;
  size: string;
  sku?: string;
  stockQuantity: number;
  additionalPrice?: number;
  price?: number;
  active?: boolean;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  primary: boolean;
  sortOrder: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  parentName?: string | null;
  active: boolean;
  children: CategoryResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  team?: string;
  league?: string;
  jerseyType?: JerseyType;
  authenticity?: JerseyAuthenticity;
  basePrice: number;
  active: boolean;
  featured: boolean;
  primaryImageUrl?: string | null;
  stockStatus: StockStatus;
  available: boolean;
}

export interface ProductDetailResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  team?: string;
  league?: string;
  country?: string;
  season?: string;
  jerseyType?: JerseyType;
  authenticity?: JerseyAuthenticity;
  material?: string;
  basePrice: number;
  active: boolean;
  featured: boolean;
  categories: CategoryResponse[];
  images: ProductImage[];
  variants: ProductVariant[];
  stockStatus: StockStatus;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  team?: string;
  league?: string;
  season?: string;
  jerseyType?: JerseyType;
  authenticity?: JerseyAuthenticity;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  size?: number;
}

export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  category?: string;
  team?: string;
  season?: string;
  imageUrl?: string;
  variants?: ProductVariant[];
  featured?: boolean;
}

export interface CartItemResponse {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku?: string | null;
  size?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  active: boolean;
  stockQuantity: number;
  available: boolean;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  total: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productVariantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface AddressResponse {
  id: string;
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  postalCode?: string | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface CouponApplyResponse {
  couponCode: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountAmount: number;
  subtotal: number;
  shippingAmount: number;
  totalAfterDiscount: number;
}

export interface CartItem {
  id: string | number;
  productId: string | number;
  productName: string;
  variantId?: string | number;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Cart {
  id: string | number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export interface Address {
  id?: string | number;
  recipientName?: string;
  fullName?: string;
  phone: string;
  division?: string;
  district?: string;
  area?: string;
  addressLine?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'PENDING';

export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentGateway = 'SSLCOMMERZ' | 'CASH_ON_DELIVERY' | 'COD';

export interface CheckoutItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface CheckoutRequest {
  shippingAddressId: string;
  couponCode?: string | null;
  paymentMethod?: 'SSLCOMMERZ' | 'CASH_ON_DELIVERY' | 'COD';
  items?: CheckoutItemRequest[];
}

export interface OrderItemResponse {
  id: string;
  productId: string | null;
  productVariantId: string | null;
  productName: string;
  sku?: string | null;
  size?: string | null;
  unitPrice: number;
  quantity: number;
  customizationPrice?: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  customizationAmount: number;
  totalAmount: number;
  currency: string;
  shippingRecipientName: string;
  shippingPhone: string;
  shippingDivision: string;
  shippingDistrict: string;
  shippingArea: string;
  shippingAddressLine: string;
  shippingPostalCode?: string | null;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitiateRequest {
  orderId: string;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  gatewayPageUrl: string;
  status: PaymentStatus;
}

export interface PaymentResponse {
  id: string;
  orderId: string | null;
  transactionId: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  size?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount?: number;
  shippingAddress: Address;
  items: OrderItem[];
  createdAt: string;
}

export interface ReviewResponse {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string | null;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummaryResponse {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  title?: string;
  comment: string;
}

export interface Review {
  id: string | number;
  productId: string | number;
  userId: string | number;
  userName: string;
  rating: number;
  title?: string;
  comment?: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minSpend?: number;
  validUntil?: string;
  active: boolean;
}

export interface AdminDashboardSummaryResponse {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSuccessfulRevenue: number;
}

export interface AdminOrderSummaryResponse {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  totalItems: number;
  createdAt: string;
}

export interface AdminOrderDetailResponse {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  customizationAmount: number;
  totalAmount: number;
  currency: string;
  shippingRecipientName: string;
  shippingPhone: string;
  shippingDivision: string;
  shippingDistrict: string;
  shippingArea: string;
  shippingAddressLine: string;
  shippingPostalCode?: string | null;
  items: OrderItemResponse[];
  payment?: PaymentResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewResponse {
  id: string;
  productId: string | null;
  productName: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCreateRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  active?: boolean;
}

export interface CouponResponse {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  team?: string;
  league?: string;
  country?: string;
  season?: string;
  jerseyType: JerseyType;
  authenticity: JerseyAuthenticity;
  material?: string;
  basePrice: number;
  featured?: boolean;
  categoryIds?: string[];
}

export interface ProductVariantCreateRequest {
  size: string;
  sku?: string;
  stockQuantity: number;
  additionalPrice?: number;
}

export interface ProductVariantAdminCreateRequest {
  sku: string;
  size: string;
  price: number;
}

export interface ProductVariantResponse {
  id: string;
  productId: string;
  sku: string;
  size: string;
  price: number;
  stockQuantity: number;
  active: boolean;
}

export interface InventoryAdjustmentRequest {
  productVariantId: string;
  quantityChange: number;
  transactionType: 'RESTOCK' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE' | 'RESERVATION' | 'RELEASE';
  note?: string;
}

export interface ProductImageCreateRequest {
  imageUrl: string;
  publicId?: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface ProductUpdateRequest {
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  team?: string;
  league?: string;
  country?: string;
  season?: string;
  jerseyType: JerseyType;
  authenticity: JerseyAuthenticity;
  material?: string;
  basePrice: number;
  featured?: boolean;
  categoryIds?: string[];
}
