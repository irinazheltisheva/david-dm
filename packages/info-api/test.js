import test from 'ava'
import os from 'os'
import bent from 'bent'
import { start } from './index.js'

test('e2e', async t => {
  const server = await start({
    port: 0,
    dbPath: os.tmpdir() + '/data/info-api',
    cacheTime: 86400000,
    npmFeedUrl: 'https://skimdb.npmjs.com/registry'
  })

  const post = bent('POST', 200, `http://localhost:${server.address().port}`)
  const res0 = await post('/', {
    compression: '^1.4.1',
    couchwatch: '^0.6.0',
    'cross-env': '^5.1.3',
    cssnano: '^3.7.3',
    cycle: '^1.0.3',
    d3: '^3.5.17',
    dateformat: '2.0.0'
  })

  const info0 = await res0.json()
  t.is(info0.status, 'outofdate')

  const { latest } = info0.deps.find(d => d.name === 'd3')
  const res1 = await post('/', { d3: `^${latest}` })
  const info1 = await res1.json()

  t.is(info1.totals.upToDate, 1)
  t.is(info1.totals.outOfDate, 0)
  t.is(info1.status, 'uptodate')

  server.close()
})
