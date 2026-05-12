// Browser stub for node:async_hooks
// Required because @tanstack/react-start (still in node_modules) imports
// AsyncLocalStorage from node:async_hooks. This stub prevents the build from
// failing while the package is being removed via `npm remove @tanstack/react-start`.
// Once removed from package.json + node_modules, this file can be deleted.
export class AsyncLocalStorage<T = unknown> {
  run<R>(_store: T, callback: () => R): R {
    return callback();
  }
  getStore(): T | undefined {
    return undefined;
  }
  enterWith(_store: T): void {}
  disable(): void {}
}

export const asyncLocalStorage = new AsyncLocalStorage();
