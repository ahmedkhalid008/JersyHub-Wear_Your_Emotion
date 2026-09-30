export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  enabled: boolean;
  emailVerified: boolean;
  createdAt?: string;
}
