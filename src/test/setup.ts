import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Scroll
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock File System API
// @ts-expect-error - Mocking File System API
window.showOpenFilePicker = vi.fn();
// @ts-expect-error - Mocking File System API
window.showSaveFilePicker = vi.fn();

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock html2canvas
vi.mock('html2canvas', () => {
  return {
    default: vi.fn().mockResolvedValue({
      toDataURL: () => 'data:image/png;base64,mocked-base64-string',
      width: 800,
      height: 600
    }),
  };
});

// Mock HTML2PDF
vi.mock('html2pdf.js', () => {
    return {
        default: () => ({
            from: () => ({
                set: () => ({
                    save: vi.fn().mockResolvedValue(true),
                    output: vi.fn().mockResolvedValue(new Blob(['mock pdf data'], { type: 'application/pdf' }))
                })
            })
        })
    }
});

// Mock document.createRange for ProseMirror in JSDOM
document.createRange = () => {
  const range = new Range();
  range.getBoundingClientRect = vi.fn(() => ({
    x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => {}
  }));
  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: vi.fn()
    } as unknown as DOMRectList;
  };
  return range;
};
