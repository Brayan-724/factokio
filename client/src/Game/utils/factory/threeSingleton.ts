export default function threeSingleton<
  T,
  C extends (...args: any[]) => T = (...args: any[]) => T,
>(constructorFn: C, displayName?: string) {
  class ThreeSingleton {
    static instance: ThreeSingleton | null = null;
    static __memoize__: Parameters<C> | null = null;

    current: T;

    constructor(...args: Parameters<C>) {
      ThreeSingleton.__memoize__ = args;
      this.current = constructorFn(...args);

      ThreeSingleton.instance = this;
    }

    set(...args: Parameters<C>) {
      ThreeSingleton.__memoize__ = args;
      this.current = constructorFn(...args);

      return this;
    }

    get(): T {
      return this.current;
    }

    static set(...args: Parameters<C>): ThreeSingleton {
      if (!ThreeSingleton.instance) {
        const newInstance = new ThreeSingleton(...args);
        return newInstance;
      }

      ThreeSingleton.instance.set(...args);

      return ThreeSingleton.instance;
    }

    static get(): T {
      if (!ThreeSingleton.instance) {
        const error = new Error(
          `${displayName || 'ThreeSingleton'} is not initialized`,
        );

        if (ThreeSingleton.__memoize__) {
          console.error(error);
          console.warn(
            `${
              displayName || 'ThreeSingleton'
            } was initialized from memoized arguments with:`,
            ThreeSingleton.__memoize__,
          );
          return constructorFn(...ThreeSingleton.__memoize__);
        }

        throw error;
      }

      return ThreeSingleton.instance.current;
    }

    [Symbol.toStringTag] = displayName || 'ThreeSingleton';
  }

  return ThreeSingleton;
}
