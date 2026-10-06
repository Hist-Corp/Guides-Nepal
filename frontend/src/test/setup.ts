import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// Node 25 can expose a global `localStorage` without a backing file (setItem is
// undefined, with a --localstorage-file warning) and jsdom mirrors that object.
// zustand's persist middleware then throws on the first setState of a persisted
// store, so swap in an in-memory Storage whenever the default can't store.
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

const localStorageWorks = (() => {
  try {
    const probeKey = '__vitest_storage_probe__';
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
})();

if (!localStorageWorks) {
  const memory = new MemoryStorage();
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: memory,
    });
  } catch {
    // Global not redefinable - patch the existing object in place instead.
    Object.assign(localStorage, {
      getItem: memory.getItem.bind(memory),
      setItem: memory.setItem.bind(memory),
      removeItem: memory.removeItem.bind(memory),
      clear: memory.clear.bind(memory),
      key: memory.key.bind(memory),
    });
  }
  try {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: memory,
    });
  } catch {
    // jsdom's window may not allow redefinition; module scope sees the global.
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
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
