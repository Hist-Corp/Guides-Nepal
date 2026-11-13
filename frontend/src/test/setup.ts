// Global test setup - mock localStorage and stores before any imports
import { vi, beforeAll, afterAll } from 'vitest';

// Mock localStorage before any imports that might use it (e.g., zustand persist)
class MemoryStorage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }

  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}

const memoryStorage = new MemoryStorage();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: memoryStorage,
});

try {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    writable: true,
    value: memoryStorage,
  });
} catch {
  // jsdom's window may not allow redefinition; module scope sees the global.
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};

// Mock scrollTo
window.scrollTo = vi.fn();

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Import jest-dom matchers after mocks are set up
import '@testing-library/jest-dom/vitest';
