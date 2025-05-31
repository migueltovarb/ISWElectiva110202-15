import { jwtDecode } from 'jwt-decode';

interface JwtToken {
  exp: number;
  user_id: number;
  [key: string]: any;
}

interface UserRole {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
  role?: UserRole;
  [key: string]: any;
}

const isBrowser = typeof window !== 'undefined';

/**
 * Retrieves the access token from localStorage
 */
export function getToken(): string | null {
  return isBrowser ? localStorage.getItem('access_token') : null;
}

/**
 * Retrieves the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  return isBrowser ? localStorage.getItem('refresh_token') : null;
}

/**
 * Stores the access and refresh tokens in localStorage
 */
export function setTokens(access: string, refresh: string): void {
  if (!isBrowser) return;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

/**
 * Removes the tokens from localStorage
 */
export function removeTokens(): void {
  if (!isBrowser) return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

/**
 * Checks if the current user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

/**
 * Retrieves the current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (!isBrowser) return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

/**
 * Stores the user in localStorage
 */
export function setCurrentUser(user: User): void {
  if (!isBrowser) return;
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Checks if the current user has a specific role
 */
export function hasRole(roleName: string): boolean {
  const user = getCurrentUser();
  return !!(user?.role?.name === roleName);
}

/**
 * Checks if the current user is an admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  return (
    !!user.is_staff ||
    !!user.is_superuser ||
    hasRole('Administrator')
  );
}

/**
 * Logs out the user by removing tokens and user data
 */
export function logout(): void {
  removeTokens();
}
