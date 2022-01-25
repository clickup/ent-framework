/**
 * Shamelessly stolen from https://www.npmjs.com/package/typescript-memoize
 * The only difference is that, if used to memoize async functions, it clears
 * the memoize cache if the promise got rejected (i.e. it doesn't memoize
 * exceptions in async functions).
 */
export default function Memoize(hashFunction?: (...args: any[]) => any) {
  return (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    if ((descriptor.value ?? null) !== null) {
      descriptor.value = getNewFunction(descriptor.value, hashFunction);
    } else if (descriptor.get) {
      descriptor.get = getNewFunction(descriptor.get, hashFunction);
    } else {
      throw "Only put a Memoize() decorator on a method or get accessor.";
    }
  };
}

let counter = 0;

function getNewFunction(
  originalMethod: () => void,
  hashFunction?: (...args: any[]) => any
) {
  const identifier = ++counter;

  // The function returned here gets called instead of originalMethod.
  return function (this: any, ...args: any) {
    const propValName = `__memoized_value_${identifier}`;
    const propMapName = `__memoized_map_${identifier}`;

    let returnedValue: any;

    if (hashFunction || args.length > 0) {
      // Get or create map
      if (!this.hasOwnProperty(propMapName)) {
        Object.defineProperty(this, propMapName, {
          configurable: false,
          enumerable: false,
          writable: false,
          value: new Map<any, any>(),
        });
      }

      const myMap: Map<any, any> = this[propMapName];
      let hashKey: any;

      if (hashFunction) {
        hashKey = hashFunction.apply(this, args);
      } else {
        hashKey = args[0];
      }

      if (myMap.has(hashKey)) {
        returnedValue = myMap.get(hashKey);
      } else {
        returnedValue = originalMethod.apply(this, args);
        if (returnedValue instanceof Promise) {
          // If the promise got rejected, remove the memoized value too.
          returnedValue = returnedValue.catch((e) => {
            myMap.delete(hashKey);
            throw e;
          });
        }

        myMap.set(hashKey, returnedValue);
      }
    } else {
      if (this.hasOwnProperty(propValName)) {
        returnedValue = this[propValName];
      } else {
        returnedValue = originalMethod.apply(this, args);
        if (returnedValue instanceof Promise) {
          // If the promise got rejected, remove the memoized value too.
          returnedValue = returnedValue.catch((e) => {
            delete this[propValName];
            throw e;
          });
        }

        Object.defineProperty(this, propValName, {
          configurable: true, // to be able to remove it
          enumerable: false,
          writable: false,
          value: returnedValue,
        });
      }
    }

    return returnedValue;
  };
}
