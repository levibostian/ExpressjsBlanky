import queryString from "query-string"

export type ParsedQueryString = { [key: string]: string | boolean | number }

// takes query string and returns parsed object:
// {foo: "string", bar: 123, foo: true}
export const parseQueryString = (url: string): ParsedQueryString => {
  // Entering an empty string will give an empty object back. That's how we force not null below.
  // https://runkit.com/embed/nciebmmblf3o
  return queryString.parseUrl(url, { parseBooleans: true, parseNumbers: true })
    .query as ParsedQueryString
}

// takes object and creates a query string from it.
// returns `foo=true&bar=123` - notice no prefix of ? character.
export const queryStringFromParsed = (parsedQueryString: ParsedQueryString): string => {
  return queryString.stringify(parsedQueryString)
}
