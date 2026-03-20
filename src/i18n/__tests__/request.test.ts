import { cookies } from 'next/headers';

import getRequestConfig from '../request';

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getRequestConfig: (fn: () => unknown) => fn,
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock translation files
jest.mock('../../../translation/en.json', () => ({
  hello: 'Hello',
  welcome: 'Welcome',
}));

jest.mock('../../../translation/id.json', () => ({
  hello: 'Halo',
  welcome: 'Selamat Datang',
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('i18n request config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default locale "en" when no lang cookie is set', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ReturnType<typeof cookies>);

    const config = await getRequestConfig();

    expect(config.locale).toBe('en');
    expect(config.messages).toEqual({
      hello: 'Hello',
      welcome: 'Welcome',
    });
  });

  it('should return locale from cookie when lang cookie is set to "id"', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'id' }),
    } as unknown as ReturnType<typeof cookies>);

    const config = await getRequestConfig();

    expect(config.locale).toBe('id');
    expect(config.messages).toEqual({
      hello: 'Halo',
      welcome: 'Selamat Datang',
    });
  });

  it('should return locale from cookie when lang cookie is set to "en"', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'en' }),
    } as unknown as ReturnType<typeof cookies>);

    const config = await getRequestConfig();

    expect(config.locale).toBe('en');
    expect(config.messages).toEqual({
      hello: 'Hello',
      welcome: 'Welcome',
    });
  });

  it('should call cookies() function', async () => {
    const mockGet = jest.fn().mockReturnValue(undefined);
    mockCookies.mockResolvedValue({
      get: mockGet,
    } as unknown as ReturnType<typeof cookies>);

    await getRequestConfig();

    expect(mockCookies).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('lang');
  });

  it('should handle different locale values from cookie', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'fr' }),
    } as unknown as ReturnType<typeof cookies>);

    // This will throw an error because we don't have fr.json mocked
    // But it tests that the locale is passed through correctly
    await expect(getRequestConfig()).rejects.toThrow();
  });

  it('should return object with locale and messages properties', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'en' }),
    } as unknown as ReturnType<typeof cookies>);

    const config = await getRequestConfig();

    expect(config).toHaveProperty('locale');
    expect(config).toHaveProperty('messages');
    expect(typeof config.locale).toBe('string');
    expect(typeof config.messages).toBe('object');
  });
});
