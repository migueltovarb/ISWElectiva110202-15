import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './config';
import {
  login,
  register,
  logout,
  getCurrentUser,
  changePassword,
  updateProfile,
  checkSession,
  isCurrentUserAdmin
} from './auth';

vi.mock('./config', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn()
  }
}));

const mockedApi = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>,
  post: ReturnType<typeof vi.fn>,
  patch: ReturnType<typeof vi.fn>
};

describe('auth.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('login should save tokens and user data', async () => {
    const mockResponse = {
      access: 'access_token',
      refresh: 'refresh_token',
      user: { id: 1, username: 'testuser' }
    };

    mockedApi.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await login('testuser', 'password123');

    expect(result.access).toBe('access_token');
    expect(localStorage.getItem('access_token')).toBe('access_token');
    expect(localStorage.getItem('refresh_token')).toBe('refresh_token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({ id: 1, username: 'testuser' });
  });

  it('register should save tokens and user data', async () => {
    const mockResponse = {
      access: 'access_reg',
      refresh: 'refresh_reg',
      user: { id: 2, username: 'newuser' }
    };

    mockedApi.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await register({ username: 'newuser', password: 'abc123' });

    expect(result.access).toBe('access_reg');
    expect(localStorage.getItem('access_token')).toBe('access_reg');
    expect(localStorage.getItem('refresh_token')).toBe('refresh_reg');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({ id: 2, username: 'newuser' });
  });

  it('getCurrentUser should fetch and store user', async () => {
    const mockUser = { id: 3, username: 'fetcheduser' };
    mockedApi.get.mockResolvedValueOnce({ data: mockUser });

    const result = await getCurrentUser();

    expect(result.username).toBe('fetcheduser');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
  });

  it('changePassword should return detail message', async () => {
    const detail = { detail: 'Password updated successfully' };
    mockedApi.post.mockResolvedValueOnce({ data: detail });

    const result = await changePassword({
      current_password: 'oldpass',
      new_password: 'newpass'
    });

    expect(result.detail).toBe('Password updated successfully');
  });

  it('updateProfile should store updated user', async () => {
    const updatedUser = { id: 1, username: 'updateduser' };
    mockedApi.patch.mockResolvedValueOnce({ data: updatedUser });

    const result = await updateProfile({ username: 'updateduser' });

    expect(result.username).toBe('updateduser');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(updatedUser);
  });

  it('logout should clear localStorage even on error', async () => {
    mockedApi.post.mockRejectedValueOnce(new Error('Network error'));

    await logout();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('checkSession should return true if session is valid', async () => {
    localStorage.setItem('access_token', 'validtoken');
    const mockUser = { id: 4, username: 'activeuser' };
    mockedApi.get.mockResolvedValueOnce({ data: mockUser });

    const result = await checkSession();

    expect(result).toBe(true);
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
  });

  it('checkSession should refresh token if expired and succeed', async () => {
    localStorage.setItem('access_token', 'expiredtoken');
    localStorage.setItem('refresh_token', 'refreshtoken');

    mockedApi.get
      .mockRejectedValueOnce({ response: { status: 401 } }) // expired token
      .mockResolvedValueOnce({ data: { id: 5, username: 'refresheduser' } }); // get user after refresh

    mockedApi.post.mockResolvedValueOnce({ data: { access: 'newtoken' } });

    const result = await checkSession();

    expect(result).toBe(true);
    expect(localStorage.getItem('access_token')).toBe('newtoken');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({ id: 5, username: 'refresheduser' });
  });

  it('checkSession should fail if refresh also fails', async () => {
    localStorage.setItem('access_token', 'expiredtoken');
    localStorage.setItem('refresh_token', 'invalidrefresh');

    mockedApi.get.mockRejectedValueOnce({ response: { status: 401 } }); // expired
    mockedApi.post.mockRejectedValueOnce(new Error('refresh failed')); // refresh fails

    const result = await checkSession();

    expect(result).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('isCurrentUserAdmin should detect admin roles', () => {
    localStorage.setItem('user', JSON.stringify({
      is_staff: true,
      is_superuser: false,
      role: { name: 'Administrator' }
    }));

    expect(isCurrentUserAdmin()).toBe(true);
  });

  it('isCurrentUserAdmin should return false without user', () => {
    localStorage.removeItem('user');
    expect(isCurrentUserAdmin()).toBe(false);
  });
});
