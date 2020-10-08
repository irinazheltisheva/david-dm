# info-api

JSON HTTP API for retrieving dependency information for a set of dependencies.

## API

### `POST /`

Request body:

An object of the form found in the `dependencies` field of a `package.json` file. e.g.

```json
{
  "compression": "^1.4.1",
  "couchwatch": "^0.6.0",
  "cross-env": "^5.1.3",
  "cssnano": "^3.7.3",
  "cycle": "^1.0.3",
  "d3": "^3.5.17",
  "dateformat": "^2.0.0"
}
```

Response:

```js
{
  status: string, // uptodate, outofdate, notsouptodate, none
  deps: Array<{
    name: string,
    required: string, // semver range from input
    stable: string, // semver version
    latest: string, // semver version
    status: string, // uptodate, outofdate
    pinned: boolean
  }>
  totals: {
    upToDate: number,
    outOfDate: number,
    pinned: {
      upToDate: number,
      outOfDate: number
    },
    unpinned: {
      upToDate: number,
      outOfDate: number
    }
  }
}
```


