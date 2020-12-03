import { KeyObject } from "../type"
import isPlainObject from "lodash.isplainobject"
import isEmail from "validator/lib/isEmail"
import omitBy from "lodash.omitby"
import lodash_isPlainObject from "lodash.isplainobject"
import lodash_isNil from "lodash.isnil"
import dayjs from "dayjs"

/**
 * We are copying the ideas from lodash here. The popular lodash project is a collection of handy functions that you can run in your javascript code like seeing if a variable is an object.
 *
 * Lodash has a couple of concepts:
 * 1. To be accessible, you import lodash in your code with, `import _ from "lodash"`. Then, you use the underscore to access all of the utility functions: `_.isPlainObject(variableHere)`. Simple, accessible.
 * 2. While some languages have these concepts of language "extensions", javascript/typescript kinda has this idea but it is hacky from my experience. Lodash instead has you pass in variables into the function needed. So instead of writing an extension function `isEmpty()` on an Array so your code would look like this: `myArray.isEmpty()`, you pass in the Array into lodash: `_.isEmpty(myArray)`. Extensions are great features to a language, but in the javascript world, this does work and is dependable.
 *
 * Yes, this object below is big but if we define it all here below, we get the benefit of a typed object for easy autocomplete in our text editor.
 *
 * Note: This utility object is meant to run operations against common data types like strings, objects, Date, etc. If you have a custom data type, make that a class and put it in `app/type/` instead of putting it here.
 */
const _ = {
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  },
  isNullOrUndefined(value: unknown): value is null | undefined {
    return lodash_isNil(value)
  },
  /**
   * _.isPlainObject(new Foo);
    // => false
    
    _.isPlainObject([1, 2, 3]);
    // => false
    
    _.isPlainObject({ 'x': 0, 'y': 0 });
    // => true
    
    _.isPlainObject(Object.create(null));
    // => true
   */
  isObject(value: unknown): boolean {
    return lodash_isPlainObject(value)
  },

  array: {
    isEmpty(array: Array<unknown>): boolean {
      return array.length <= 0
    },
    last<T>(array: Array<T>): T | undefined {
      if (this.isEmpty(array)) return undefined

      return array[array.length - 1]
    }
  },

  obj: {
    // Traverses all of the properties of an Object (including nested Objects and Arrays of Objects) and allows you to optionally modify the value.
    mapAllProperties(
      _obj: KeyObject,
      check: (item: { key: string; value: unknown }) => unknown | undefined
    ): KeyObject {
      const obj = _obj

      const helper = (obj: { [key: string]: unknown }): void => {
        Object.keys(obj).forEach(function (key) {
          const value = obj[key]

          // Nested object
          if (isPlainObject(value)) {
            helper(value as { [key: string]: unknown })
          } else if (Array.isArray(value)) {
            // array of Objects
            value.forEach((item) => {
              if (isPlainObject(item)) {
                helper(item)
              } else {
                // The value is an Array, but not an array of objects. More then likely an Array of strings or something.
                // To keep this util function not complex, we are going to just ignore these and leave them be in the Object.
              }
            })
          } else {
            const editedValue = check({ key: key, value: value })
            if (editedValue) {
              obj[key] = editedValue
            }
          }
        })
      }

      helper(obj)

      return obj
    },
    trimAllStrings(obj: KeyObject): void {
      this.mapAllProperties(obj, (value) => {
        if (typeof value === "string") {
          return (value as string).trim()
        }
      })
    },
    removeNilValues(obj: KeyObject): KeyObject {
      return omitBy(obj, lodash_isNil)
    }
  },

  promise: {
    async runAllSequential<T>(promises: Promise<T>[]): Promise<T[]> {
      const values: T[] = []

      for await (const value of promises) {
        values.push(value)
      }

      return values
    }
  },

  string: {
    normalizeEmail(email: string): string {
      if (isEmail(email)) {
        return email.toLowerCase() as string
      } else {
        return email
      }
    }
  },

  int: {
    // Returns a random whole number between min (inclusive) and max (inclusive)
    random(min = 1, max = 1000): number {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  },

  date: {
    dateFormat: "YYYY-MM-DDTHH:mm:ssZ",
    toString(date?: Date): string | undefined {
      if (!date) return undefined
      return dayjs(date).format(this.dateFormat)
    },
    formatAllDates(obj: KeyObject): KeyObject {
      return _.obj.mapAllProperties(obj, (value) => {
        if (value instanceof Date) {
          // Thanks, https://stackoverflow.com/a/643827/1486374
          return this.toString(value)
        } else {
          return undefined
        }
      })
    }
  },

  json: {
    parse<T>(text: string): T {
      // When you use `JSON.parse()` on a string that includes a Date object, the object property that stores the date will remain a string, not a Date object.
      const jsonReviver = (key: string, value: unknown): unknown => {
        // Assuming this ia  valid date string, 2020-03-06T17:35:49Z.......
        // Using string length check because Date.parse() accepts integers so it would parse a DB table ID into a date, for example.
        // Also check there are dashes which mean it could be a date string.
        if (
          typeof value === "string" &&
          value.length >= 20 &&
          value.includes("-") &&
          !isNaN(Date.parse(value))
        ) {
          return new Date(value)
        }

        return value
      }

      return JSON.parse(text, jsonReviver)
    }
  }
}

export default _

export const _arrayIsEmpty = <T>(array: T[]): boolean => {
  return false
}
