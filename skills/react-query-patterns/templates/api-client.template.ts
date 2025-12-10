// ============================================================================
// API Client Template
// ============================================================================
// This template generates a production-ready API client using ky with hooks,
// error handling, authentication, and TypeScript support.
//
// Location: shared/api/client.ts
// ============================================================================

import ky, { type KyInstance, type Options, type BeforeRequestHook, type AfterResponseHook } from 'ky';

/**
 * API Client configuration options
 */
export interface ApiClientConfig {
  prefixUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  retry?: number;
}

/**
 * API Error with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Production-ready API Client using ky
 *
 * Features:
 * - Automatic authentication token injection
 * - Request/response hooks
 * - Error handling and transformation
 * - Type-safe methods
 * - Automatic JSON parsing
 * - Built-in retry logic
 * - Logging (dev mode only)
 *
 * @example
 * ```typescript
 * // shared/api/client.ts
 * export const apiClient = new ApiClient({
 *   prefixUrl: import.meta.env.VITE_API_BASE_URL,
 * });
 *
 * // entities/user/api/user.api.ts
 * export const userApi = {
 *   async getAll() {
 *     return await apiClient.get<User[]>('users');
 *   },
 * };
 * ```
 */
export class ApiClient {
  private client: KyInstance;

  constructor(config: ApiClientConfig) {
    this.client = ky.create({
      prefixUrl: config.prefixUrl,
      timeout: config.timeout || 30000, // 30 seconds default
      credentials: config.credentials ?? 'same-origin',
      retry: config.retry ?? 1,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      hooks: {
        beforeRequest: [this.beforeRequestHook.bind(this)],
        afterResponse: [this.afterResponseHook.bind(this)],
      },
    });
  }

  /**
   * Before request hook - adds authentication and logging
   */
  private beforeRequestHook: BeforeRequestHook = (request) => {
    // Add authentication token
    const token = this.getAuthToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${request.method} ${request.url}`);
    }
  };

  /**
   * After response hook - handles logging and errors
   */
  private afterResponseHook: AfterResponseHook = async (request, options, response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${request.url}`, {
        status: response.status,
      });
    }

    // Handle error responses
    if (!response.ok) {
      await this.handleError(response);
    }

    return response;
  };

  /**
   * Get authentication token from storage
   * Override this method to customize token retrieval
   */
  protected getAuthToken(): string | null {
    // TODO: Customize based on your auth implementation
    return localStorage.getItem('auth_token');
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<never> {
    const status = response.status;
    let data: any;

    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    console.error(`[API Error] ${status} - ${response.url}`, data);

    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        this.handleUnauthorized();
        break;
      case 403:
        // Forbidden
        console.warn('[API] Access forbidden');
        break;
      case 404:
        // Not found
        console.warn('[API] Resource not found');
        break;
      case 500:
        // Server error
        console.error('[API] Server error');
        break;
    }

    throw new ApiError(
      data?.message || response.statusText || 'An error occurred',
      status,
      data?.code,
      data
    );
  }

  /**
   * Handle unauthorized (401) responses
   * Override this method to customize unauthorized handling
   */
  protected handleUnauthorized() {
    // TODO: Customize based on your auth flow
    console.warn('[API] Unauthorized - clearing auth');
    localStorage.removeItem('auth_token');

    // Redirect to login (adjust based on your routing setup)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options?: Options): Promise<T> {
    return this.client.get(url, options).json<T>();
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options?: Options): Promise<T> {
    return this.client.post(url, { ...options, json: data }).json<T>();
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options?: Options): Promise<T> {
    return this.client.put(url, { ...options, json: data }).json<T>();
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, options?: Options): Promise<T> {
    return this.client.patch(url, { ...options, json: data }).json<T>();
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: Options): Promise<T> {
    return this.client.delete(url, options).json<T>();
  }

  /**
   * DELETE request without response body
   */
  async deleteNoContent(url: string, options?: Options): Promise<void> {
    await this.client.delete(url, options);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
});

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Basic usage in entity API

// entities/user/api/user.api.ts
import { apiClient } from '@/shared/api/client';
import type { User, UserDto } from '../model';

export const userApi = {
  async getAll(): Promise<User[]> {
    const dtos = await apiClient.get<UserDto[]>('users');
    return dtos.map(mapDtoToDomain);
  },

  async getById(id: string): Promise<User> {
    const dto = await apiClient.get<UserDto>(`users/${id}`);
    return mapDtoToDomain(dto);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    const dto = await apiClient.post<UserDto>('users', data);
    return mapDtoToDomain(dto);
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const dto = await apiClient.patch<UserDto>(`users/${id}`, data);
    return mapDtoToDomain(dto);
  },

  async delete(id: string): Promise<void> {
    await apiClient.deleteNoContent(`users/${id}`);
  },
};

// ============================================================================

// Example 2: With query parameters

export const productApi = {
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    const dtos = await apiClient.get<ProductDto[]>('products', {
      searchParams: {
        search: filters?.search,
        category: filters?.category,
        minPrice: filters?.minPrice,
        maxPrice: filters?.maxPrice,
        page: filters?.page,
        limit: filters?.limit,
      },
    });
    return dtos.map(mapDtoToDomain);
  },
};

// ============================================================================

// Example 3: With form data (file upload)

export const fileApi = {
  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiClient.post<{ url: string }>('upload', undefined, {
      body: formData,
      // ky automatically sets correct Content-Type for FormData
    });
  },
};

// ============================================================================

// Example 4: Custom error handling

async function handleApiCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 404:
          toast.error('Resource not found');
          break;
        case 403:
          toast.error('You don\'t have permission');
          break;
        default:
          toast.error(error.message);
      }
    } else {
      toast.error('An unexpected error occurred');
    }
    return null;
  }
}

// Usage:
const user = await handleApiCall(() => userApi.getById('123'));

// ============================================================================

// Example 5: Authentication integration

// features/auth/api/auth.api.ts
import { apiClient } from '@/shared/api/client';

export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await apiClient.post<{ token: string; user: UserDto }>('auth/login', {
      email,
      password,
    });

    // Store token
    apiClient.setAuthToken(data.token);

    return {
      token: data.token,
      user: mapDtoToDomain(data.user),
    };
  },

  async logout(): Promise<void> {
    await apiClient.post('auth/logout');
    apiClient.clearAuthToken();
  },

  async refreshToken(): Promise<string> {
    const data = await apiClient.post<{ token: string }>('auth/refresh');
    apiClient.setAuthToken(data.token);
    return data.token;
  },
};

*/

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/*
// Pattern 1: Custom API client for specific domain

export class UserApiClient extends ApiClient {
  constructor() {
    super({
      prefixUrl: import.meta.env.VITE_USER_API_BASE_URL,
    });
  }

  // Add user-specific methods
  async getCurrentUser(): Promise<User> {
    const dto = await this.get<UserDto>('me');
    return mapDtoToDomain(dto);
  }
}

export const userApiClient = new UserApiClient();

// ============================================================================

// Pattern 2: Request queue for rate limiting

class RateLimitedApiClient extends ApiClient {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestsPerSecond = 10;

  async enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const request = this.queue.shift();

    if (request) {
      await request();
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 / this.requestsPerSecond)
      );
      this.processQueue();
    }
  }
}

// ============================================================================

// Pattern 3: Custom retry logic (ky has built-in retry)

class CustomRetryApiClient extends ApiClient {
  constructor(config: ApiClientConfig) {
    super({
      ...config,
      retry: {
        limit: 3,
        methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        backoffLimit: 3000,
      } as any,
    });
  }
}

*/

