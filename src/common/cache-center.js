class CacheCenter {
  cache = new Map()
  currentId = null

  constructor (name = 'cache-center') {
    this.name = name
  }

  setData (id, data) {
    id = '' + id
    this.currentId = id
    this.cache.set(id, data)
  }

  getData (id, isClone) {
    const e = this.cache.get('' + id)
    if (!isClone) {
      return e
    }
    if (e instanceof String || !e) {
      return e
    }
    return JSON.parse(JSON.stringify(e))
  }

  delete (id) {
    return this.cache.delete('' + id)
  }

  deleteCurrent () {
    return this.delete(this.currentId)
  }

  clear () {
    this.cache.clear()
  }
}

const cache = {
  UserCache: new CacheCenter('user'),
  PoetryPageCache: new CacheCenter('petory-page'),
  PoetrySetCache: new CacheCenter('petory-set'),
  OptionCache: new CacheCenter('option'),
  OPTION: {
    CREATE: 'option-create',
    UDPATE: 'option-update',
    DELETE: 'option-delete'
  }
}

window.GlobalCache = cache
export default cache

// export const UserCache = new CacheCenter('user')
