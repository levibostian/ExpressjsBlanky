export * from "./dynamic_link"
import isPlainObject from "lodash.isplainobject"
import isEmail from "validator/lib/isEmail"
import dayjs from "dayjs"

export const sleep = function(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const trimAllStrings = (obj: { [key: string]: any }): void => {
  const helper = (obj: { [key: string]: any }): void => {
    Object.keys(obj).forEach(function(key) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].trim()
      }

      // Nested object
      if (isPlainObject(obj[key])) {
        helper(obj[key])
      }

      if (Array.isArray(obj[key])) {
        const arrayTrimmed: any[] = []

        obj[key].forEach((item: any) => {
          if (typeof item === "string") {
            arrayTrimmed.push(item.trim())
          } else {
            arrayTrimmed.push(item)
          }
        })

        obj[key] = arrayTrimmed
      }
    })
  }

  helper(obj)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable no-await-in-loop */
export const PromiseAllSequential = async <T>(promises: Promise<T>[]): Promise<T[]> => {
  const values: T[] = []

  for (let i = 0; i < promises.length; i++) {
    const val = await promises[i]
    values.push(val)
  }

  return values
}
/* eslint-enable no-await-in-loop */

export const normalizeEmail = (email: string): string => {
  if (isEmail(email)) {
    return email.toLowerCase() as string
  } else {
    return email
  }
}

// Returns a random whole number between min (inclusive) and max (inclusive)
export const randomInt = (min = 1, max = 10000): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mapAllProperties = (
  _obj: { [key: string]: any },
  check: (value: any) => any | undefined
): Object => {
  const obj = _obj

  const helper = (obj: { [key: string]: any }): void => {
    Object.keys(obj).forEach(function(key) {
      const value = obj[key]

      // Nested object
      if (isPlainObject(value)) {
        helper(value)
      } else if (Array.isArray(value)) {
        value.forEach((item: any) => {
          helper(item)
        })
      } else {
        const editedValue = check(value)
        if (editedValue) {
          obj[key] = editedValue
        }
      }
    })
  }

  helper(obj)

  return obj
}

export const formatAllDates = (obj: { [key: string]: any }): Object => {
  return mapAllProperties(obj, value => {
    if (value instanceof Date) {
      // Thanks, https://stackoverflow.com/a/643827/1486374
      return dayjs(value).format("YYYY-MM-DDTHH:mm:ssZ")
    } else {
      return undefined
    }
  })
}
/* eslint-enable @typescript-eslint/no-explicit-any */
