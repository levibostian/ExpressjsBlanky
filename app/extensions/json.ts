/**
 * Use: `JSON.parse(object, jsonReviver)`
 *
 * When you use `JSON.parse()` on a string that includes a Date object, the object property that stores the date will remain a string, not a Date object.
 * You must use a "reviver" function for `JSON.parse()`
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
export const jsonReviver = (key: string, value: any): any => {
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
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
