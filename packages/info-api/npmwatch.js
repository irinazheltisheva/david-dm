import couchwatch from 'couchwatch'
import { EventEmitter } from 'events'

export default class NpmWatcher extends EventEmitter {
  constructor (url) {
    super()
    const watcher = couchwatch(url, -1)
      .on('row', change => this.emit('change', change))
      .on('error', err => {
        // Downgrade the error event from an EXIT THE PROGRAM to a warn log
        console.warn('couchwatch error', err)
        // Try again in a bit
        setTimeout(() => watcher.init(), 5 * 1000)
      })

    this.watcher = watcher
  }
}
