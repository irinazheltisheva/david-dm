import semver from 'semver'
import * as david from 'david'
import map from 'p-map'

const CONCURRENCY = 25

// Infobase provides information about what is considered to be an out of date
// or up to date dependency.
export default class Infobase {
  constructor (cache) {
    this._cache = cache
  }

  async get (deps) {
    const info = await this._dependenciesInfo(deps, { semver: { loose: true } })
    const updatedInfo = updatedDependenciesInfo(info)
    const updatedStableInfo = updatedDependenciesInfo(info, { stable: true })

    const depNames = Object.keys(info).sort()
    const totals = {
      upToDate: 0,
      outOfDate: 0,
      pinned: { upToDate: 0, outOfDate: 0 },
      unpinned: { upToDate: 0, outOfDate: 0 }
    }

    const depList = depNames.map(name => {
      // Lets disprove this
      let status = 'uptodate'

      // If there is an updated STABLE dependency then this dep is out of date
      if (updatedStableInfo[name]) {
        status = 'outofdate'
      // If it is in the UNSTABLE list, and has no stable version then consider out of date
      } else if (updatedInfo[name] && !updatedInfo[name].stable) {
        status = 'outofdate'
      }

      const pinned = isPinned(info[name].required)

      const depInfo = {
        name,
        required: info[name].required,
        stable: info[name].stable,
        latest: info[name].latest,
        status,
        pinned
      }

      if (status === 'uptodate' && pinned) {
        depInfo.upToDate = true
        totals.upToDate++
        totals.pinned.upToDate++
      } else if (status === 'uptodate' && !pinned) {
        depInfo.upToDate = true
        totals.upToDate++
        totals.unpinned.upToDate++
      } else if (status === 'outofdate' && pinned) {
        depInfo.outOfDate = true
        totals.outOfDate++
        totals.pinned.outOfDate++
      } else if (status === 'outofdate' && !pinned) {
        depInfo.outOfDate = true
        totals.outOfDate++
        totals.unpinned.outOfDate++
      }

      return depInfo
    })

    // Figure out the overall status for this manifest
    let status = depList.length ? 'uptodate' : 'none'

    if (totals.unpinned.outOfDate) {
      if (totals.unpinned.outOfDate / depList.length > 0.25) {
        status = 'outofdate'
      } else {
        status = 'notsouptodate'
      }
    }

    return { status, deps: depList, totals }
  }

  async _dependenciesInfo (deps, opts) {
    deps = david.normalizeDependencies(deps)
    // Get the dependency info we already have cached information for
    const cachedInfos = await this._cachedDependenciesInfo(deps)
    const uncachedDeps = Object.fromEntries(Object.entries(deps).filter(([k]) => !cachedInfos[k]))
    if (!Object.keys(uncachedDeps).length) return cachedInfos

    const infos = await david.dependenciesInfo(uncachedDeps, opts)
    await this._cache.setMany(Object.entries(infos))

    return { ...cachedInfos, ...infos }
  }

  async _cachedDependenciesInfo (deps) {
    const entries = await map(Object.entries(deps), async ([k, v]) => {
      const cachedInfo = await this._cache.get(k)
      if (cachedInfo) return [k, { ...cachedInfo, required: v }]
    }, { concurrency: CONCURRENCY })
    return Object.fromEntries(entries.filter(Boolean))
  }
}

function isPinned (version) {
  if (version === '*' || version === 'latest') {
    return false
  }
  const range = semver.validRange(version, true)
  if (range && range.indexOf('>=') === 0) {
    return false
  }
  return true
}

function updatedDependenciesInfo (info, opts) {
  opts = { semver: { loose: true }, ...(opts || {}) }
  return Object.fromEntries(Object.entries(info).filter(([, v]) => david.isUpdated(v, opts)))
}
