import {
  getToken,
  getRefreshToken,
  setTokens,
  removeTokens,
  isAuthenticated,
  getCurrentUser,
  setCurrentUser,
  hasRole,
  isAdmin,
  logout,
} from './auth';

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
  default: vi.fn(), // soporte para import default
}));

import { jwtDecode } from 'jwt-decode';

describe('auth.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should store and retrieve access and refresh tokens', () => {
    setTokens('access123', 'refresh456');

    expect(getToken()).toBe('access123');
    expect(getRefreshToken()).toBe('refresh456');
  });

  it('should remove tokens from localStorage', () => {
    setTokens('access123', 'refresh456');
    removeTokens();

    expect(getToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('should return false for isAuthenticated with no token', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('should return false for isAuthenticated with invalid token', () => {
    localStorage.setItem('access_token', 'bad.token');
    (jwtDecode as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(isAuthenticated()).toBe(false);
  });

  it('should return true for isAuthenticated with valid token', () => {
    localStorage.setItem('access_token', 'valid.token');
    (jwtDecode as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    expect(isAuthenticated()).toBe(true);
  });

  it('should store and retrieve current user', () => {
    const user = { id: 1, username: 'testuser', role: { id: 1, name: 'User' } };
    setCurrentUser(user);

    const result = getCurrentUser();
    expect(result?.username).toBe('testuser');
  });

  it('should detect role correctly', () => {
    const user = { id: 1, username: 'john', role: { id: 2, name: 'Manager' } };
    setCurrentUser(user);

    expect(hasRole('Manager')).toBe(true);
    expect(hasRole('Admin')).toBe(false);
  });

  it('should detect admin correctly via is_staff or is_superuser', () => {
    setCurrentUser({ id: 2, username: 'admin1', is_staff: true });
    expect(isAdmin()).toBe(true);

    setCurrentUser({ id: 3, username: 'admin2', is_superuser: true });
    expect(isAdmin()).toBe(true);

    setCurrentUser({ id: 4, username: 'admin3', role: { id: 3, name: 'Administrator' } });
    expect(isAdmin()).toBe(true);
  });

  it('should logout and remove all auth data', () => {
    setTokens('tok1', 'tok2');
    setCurrentUser({ id: 1, username: 'user' });

    logout();

    expect(getToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });
});
