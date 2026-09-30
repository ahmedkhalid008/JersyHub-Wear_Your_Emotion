import '@testing-library/jest-dom';

// Ensure localStorage mock is present in JSDOM / Node environment
if (typeof window !== 'undefined' && !window.localStorage) {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}
