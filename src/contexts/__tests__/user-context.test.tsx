import { render, screen, waitFor } from '@testing-library/react';
import { deleteCookie, getCookie } from 'cookies-next/client';
import { act } from 'react';

import { UserProfile, UserProvider, useUser } from '../user-context';

// Mock cookies-next/client
jest.mock('cookies-next/client', () => ({
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockGetCookie = getCookie as jest.MockedFunction<typeof getCookie>;
const mockDeleteCookie = deleteCookie as jest.MockedFunction<
  typeof deleteCookie
>;

describe('UserContext', () => {
  const mockUser: UserProfile = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
  };

  // Store original location
  let originalLocation: Location;
  let mockReload: jest.Mock;

  beforeAll(() => {
    // Save original location
    originalLocation = window.location;
    mockReload = jest.fn();
    // @ts-expect-error - Mocking location
    window.location = { reload: mockReload };
  });

  afterAll(() => {
    // Restore original location
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserProvider', () => {
    it('should show loading state initially', () => {
      mockGetCookie.mockReturnValue(undefined);

      const TestComponent = () => {
        const { loading } = useUser();
        return (
          <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });

    it('should fetch user profile when token exists', async () => {
      mockGetCookie.mockReturnValue('valid-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser }),
      } as Response);

      const TestComponent = () => {
        const { user, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });
    });

    it('should set user to null when no token exists', async () => {
      mockGetCookie.mockReturnValue(undefined);

      const TestComponent = () => {
        const { user, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });

    it('should set user to null when API returns error', async () => {
      mockGetCookie.mockReturnValue('invalid-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const TestComponent = () => {
        const { user, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });

    it('should set user to null when fetch throws error', async () => {
      mockGetCookie.mockReturnValue('valid-token');
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const TestComponent = () => {
        const { user, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
  });

  describe('useUser hook', () => {
    it('should throw error when used outside UserProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const TestComponent = () => {
        useUser();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useUser must be used within <UserProvider>',
      );

      consoleSpy.mockRestore();
    });

    it('should provide refresh function', async () => {
      mockGetCookie.mockReturnValue('valid-token');
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { ...mockUser, name: 'Updated User' } }),
        } as Response);

      const TestComponent = () => {
        const { user, refresh, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
            <button data-testid="refresh" onClick={() => refresh()}>
              Refresh
            </button>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('Test User');

      // Click refresh button
      await act(async () => {
        screen.getByTestId('refresh').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Updated User');
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should provide logout function', async () => {
      mockGetCookie.mockReturnValue('valid-token');
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        } as Response)
        .mockResolvedValueOnce({} as Response);

      const TestComponent = () => {
        const { user, logout, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
            <button data-testid="logout" onClick={() => logout()}>
              Logout
            </button>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('Test User');

      // Click logout button
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No User');
      });

      expect(mockDeleteCookie).toHaveBeenCalledWith('token');
      expect(mockReload).toHaveBeenCalled();
    });

    it('should provide setUser function', async () => {
      mockGetCookie.mockReturnValue('valid-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser }),
      } as Response);

      const TestComponent = () => {
        const { user, setUser, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
            <button
              data-testid="setUser"
              onClick={() =>
                setUser({
                  id: 2,
                  name: 'Manual User',
                  email: 'manual@example.com',
                  created_at: '2024-01-01T00:00:00Z',
                })
              }
            >
              Set User
            </button>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('Test User');

      // Click setUser button
      await act(async () => {
        screen.getByTestId('setUser').click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('Manual User');
    });

    it('should handle logout when logout API fails', async () => {
      mockGetCookie.mockReturnValue('valid-token');
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        } as Response)
        .mockRejectedValueOnce(new Error('Logout failed'));

      const TestComponent = () => {
        const { user, logout, loading } = useUser();
        return (
          <div>
            <div data-testid="loading">
              {loading ? 'Loading' : 'Not Loading'}
            </div>
            <div data-testid="user">{user ? user.name : 'No User'}</div>
            <button data-testid="logout" onClick={() => logout()}>
              Logout
            </button>
          </div>
        );
      };

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      // Click logout button - should still work even if API fails
      await act(async () => {
        screen.getByTestId('logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No User');
      });

      expect(mockDeleteCookie).toHaveBeenCalledWith('token');
      expect(mockReload).toHaveBeenCalled();
    });
  });
});
