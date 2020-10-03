import omitBy from "lodash.omitby"
import isnil from "lodash.isnil"

/**
 * Removes undefined and null values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const removeNilValues = (object: any): any => {
  return omitBy(object, isnil)
}
