import queryString from "query-string"

export type ParsedQueryString = { [key: string]: string | boolean | number }

export class QueryString {
  constructor(public url: string) {
    if (!QueryString.isAbleToBeQueryString(url)) {
      throw new Error(`Given url is not a URL. Cannot create query string from: ${url}`)
    }
  }

  static isAbleToBeQueryString(url: string): boolean {
    return url.startsWith("http")
  }

  // takes object and creates a query string from it.
  // returns `foo=true&bar=123` - notice no prefix of ? character.
  static createQueryString(parsedQueryString: ParsedQueryString): string {
    return queryString.stringify(parsedQueryString)
  }

  // takes query string and returns parsed object:
  // {foo: "string", bar: 123, foo: true}
  parse(): ParsedQueryString {
    // Entering an empty string will give an empty object back. That's how we force not null below.
    // https://runkit.com/embed/nciebmmblf3o
    return queryString.parseUrl(this.url, { parseBooleans: true, parseNumbers: true })
      .query as ParsedQueryString
  }
}
