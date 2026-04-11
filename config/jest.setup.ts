/**
 * Jest global setup and teardown
 */

export async function globalTeardown() {
  // Force cleanup any open handles
  if (typeof global.gc === 'function') {
    global.gc();
  }
  
  // Clear any timers or intervals
  const intervals = [];
  const timeouts = [];
  
  // Note: We can't directly access Jest's internal timers,
  // but we can try to force cleanup
  try {
    // @ts-ignore
    if (typeof jest !== 'undefined' && typeof jest.resetAllMocks === 'function') {
      jest.resetAllMocks();
    }
  } catch (e) {
    // Ignore errors
  }
}

export async function globalSetup() {
  // Enable garbage collection if available
  if (typeof global.gc === 'function') {
    global.gc();
  }
}
