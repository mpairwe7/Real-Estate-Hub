/**
 * Playwright Global Setup
 * Polyfills for Web APIs in Node.js test environment
 */

import { TextEncoder, TextDecoder } from 'util';
import { Readable, Writable, Transform } from 'stream';

// Polyfill TransformStream for Node.js environment
if (typeof global.TransformStream === 'undefined') {
  class TransformStreamPolyfill {
    readable: ReadableStream;
    writable: WritableStream;

    constructor(transformer?: any) {
      const readable = new ReadableStream({
        start(controller) {
          // Store controller for later use
          (this as any)._controller = controller;
        }
      });

      const writable = new WritableStream({
        write(chunk) {
          // Forward chunk to readable stream
          if ((readable as any)._controller) {
            (readable as any)._controller.enqueue(chunk);
          }
        },
        close() {
          if ((readable as any)._controller) {
            (readable as any)._controller.close();
          }
        }
      });

      this.readable = readable;
      this.writable = writable;
    }
  }

  // @ts-ignore - Polyfill for Node.js
  global.TransformStream = TransformStreamPolyfill;
}

// Polyfill TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

// Export empty object to satisfy TypeScript
export {};
