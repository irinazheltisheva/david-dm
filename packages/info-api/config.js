import rc from 'rc'

export default rc('info-api', {
  port: '3000',
  dbPath: 'data/info-api',
  cacheTime: 86400000,
  npmFeedUrl: 'https://skimdb.npmjs.com/registry'
})
