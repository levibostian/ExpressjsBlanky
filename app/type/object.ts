/**
 * Using `Object` is not as good as the one below because `Object` does not imply that the keys are strings as this does. Use this in place of `Object`.
 */
export type KeyObject = { [key: string]: unknown }
