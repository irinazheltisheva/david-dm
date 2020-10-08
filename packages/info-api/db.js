import path from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import level from 'level'

export function create (dbPath) {
  dbPath = path.resolve(dbPath, process.env.NODE_ENV || 'development')
  mkdirp.sync(dbPath)
  rimraf.sync(dbPath)
  console.log(`Clearing existing database @ ${dbPath}`)
  mkdirp.sync(dbPath)
  return level(dbPath, { valueEncoding: 'json' })
}
