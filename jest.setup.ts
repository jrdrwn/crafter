// Import jest-dom matchers untuk assertions seperti toBeInTheDocument(), toHaveClass(), dll
import "@testing-library/jest-dom";

// Mock ResizeObserver
// global.ResizeObserver = class {
//   observe() {}
//   unobserve() {}
//   disconnect() {}
// };

// // Mock scrollIntoView
// window.HTMLElement.prototype.scrollIntoView = function() {};

// // Mock PointerEvent
// if (typeof window !== "undefined" && !window.PointerEvent) {
//   class PointerEvent extends Event {
//     button: number;
//     ctrlKey: boolean;
//     pointerType: string;
//     constructor(type: string, props: PointerEventInit = {}) {
//       super(type, props);
//       this.button = props.button || 0;
//       this.ctrlKey = props.ctrlKey || false;
//       this.pointerType = props.pointerType || "mouse";
//     }
//   }
//   window.PointerEvent = PointerEvent as any;
// }
// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom

// import { configure } from '@testing-library/dom';

// configure({
//     getElementError: (message, container) => {
//       const error = new Error(message);
//       error.name = 'TestingLibraryElementError';
//       error.stack = undefined; // Clear stack trace for cleaner test output
//       return error;
//     },
//   });