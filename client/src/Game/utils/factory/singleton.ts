type ClassType<A extends any[], I> = new (...args: A) => I;

interface SingletonClass<INSTANCE> {
  interface: INSTANCE | null;
  get(): INSTANCE;
}

export default function singleton<ARGUMENTS extends any[], INSTANCE>(
  _class: ClassType<ARGUMENTS, INSTANCE>,
  uniq: boolean = true,
) {
  const displayName = _class.name || 'Singleton';

  // @ts-expect-error - We know this is a class
  // ts(2509)
  return class Singleton extends _class {
    static instance: INSTANCE;
    static __memoized__: ARGUMENTS | null = null;

    constructor(...args: ARGUMENTS) {
      super(...args);

      // if uniq is true, we can't overwrite the instance
      if (!(Singleton.instance && uniq)) {
        Singleton.instance = this as unknown as INSTANCE;
      }
    }

    static get(): INSTANCE {
      if (!Singleton.instance) {
        throw new Error(`${displayName} is not initialized`);
      }

      return Singleton.instance;
    }
  } as unknown as ClassType<ARGUMENTS, INSTANCE> & SingletonClass<INSTANCE>;
}
