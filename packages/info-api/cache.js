export default class Cache {
  constructor (db, cacheTime) {
    this._db = db
    this._cacheTime = cacheTime || 86400000
  }

  async get (key) {
    try {
      const { expires, value } = await this._db.get(key)
      return expires > Date.now() ? value : null
    } catch (err) {
      if (err.notFound) return null
      throw err
    }
  }

  async setMany (kvs) {
    const expires = Date.now() + this._cacheTime
    const batch = kvs.map(([key, value]) => ({ type: 'put', key, value: { expires, value } }))
    await this._db.batch(batch)
  }

  async del (key) {
    try {
      await this._db.del(key)
    } catch (err) {
      if (!err.notFound) throw err
    }
  }
}
