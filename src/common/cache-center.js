class CacheCenter {
  cache = new Map()
  currentId = null

  constructor (name = 'cache-center') {
    this.name = name
  }

  setData (id, data) {
    this.currentId = id
    this.cache.set(id, data)
  }

  getData (id) {
    return this.cache.get(id)
  }

  delete (id) {
    return this.cache.delete(id)
  }

  deleteCurrent () {
    return this.delete(this.currentId)
  }

  clear () {
    this.cache.clear()
  }
}

export default {
  UserCache: new CacheCenter('user'),
  PeotryPageCache: new CacheCenter('petory-page'),
  PeotrySetCache: new CacheCenter('petory-set')
}

// export const UserCache = new CacheCenter('user')
