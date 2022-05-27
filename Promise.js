class Promise {
  static PENDING = 'PENDING'
  static FULFILLED = 'FULFILLED'
  static REJECTED = 'REJECTED'
  
  constructor(executor) {
    this.status = Promise.PENDING
    this.value = null
    this.onFulfilledCallbacks = []
    this.onRejecteddCallbacks = []
    try {
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }
  
  resolve(value) {
    if (this.status === Promise.PENDING) {
      this.status = Promise.FULFILLED
      this.value = value
      this.onFulfilledCallbacks.forEach(cb => cb())
    }
  }
  
  reject(value) {
    if (this.status === Promise.PENDING) {
      this.status = Promise.REJECTED
      this.value = value
      this.onRejecteddCallbacks.forEach(cb => cb())
    }
    
  }
  
  then(onFulfilled, onRejected) {
    let isNoop = Object.prototype.toString.call(onRejected).slice(8, -1) !== 'Function'
    onFulfilled = Object.prototype.toString.call(onFulfilled).slice(8, -1) === 'Function' ? onFulfilled : v => v
    onRejected = Object.prototype.toString.call(onRejected).slice(8, -1) === 'Function' ? onRejected : v => v
    let callbackRet
    let promise
    switch (this.status) {
      case Promise.FULFILLED:
        promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              callbackRet = onFulfilled(this.value)
              if (callbackRet === promise) {
                throw new TypeError('cyclic reference')
              } else if (callbackRet instanceof Promise) {
                callbackRet.then(res => {
                  resolve(res)
                })
              } else {
                resolve(callbackRet)
              }
            } catch (e) {
              reject(e)
            }
          })
        })
        break;
      case Promise.REJECTED:
        promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              callbackRet = onRejected(this.value)
              isNoop ? reject(callbackRet) : resolve(callbackRet)
            } catch (e) {
              reject(e)
            }
          })
        })
        break;
      case Promise.PENDING:
        promise = new Promise((resolve, reject) => {
          this.onFulfilledCallbacks.push(() => {
            setTimeout(() => {
              try {
                callbackRet = onFulfilled(this.value)
                if (callbackRet === promise) {
                  throw new TypeError('cyclic reference !')
                } else if (callbackRet instanceof Promise) {
                  callbackRet.then(res => {
                    resolve(res)
                  })
                } else {
                  resolve(callbackRet)
                }
              } catch (e) {
                reject(e)
              }
            },0)
          })
          this.onRejecteddCallbacks.push(() => {
            setTimeout(() => {
              try {
                callbackRet = onRejected(this.value)
                isNoop ? reject(callbackRet) : resolve(callbackRet)
              } catch (e) {
                reject(e)
              }
            })
          })
        })
        break;
      default:
        break
    }
    return promise
  }
  
  catch(onRejected) {
    return this.then(null, onRejected)
  }
  
  finally(cb) {
    return this.then(v => Promise.resolve(cb()).then(() => v), v => Promise.reject(cb()).then(null, () => v))
  }
  
  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }
  
  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value)
    })
  }
  
  static all(promises) {
    const ret = []
    let count = promises.length
    return new Promise((resolve, reject) => {
      promises.forEach(promises.then(res => {
        ret.push(res)
        count--
        !count && resolve(ret)
      }, reject))
    })
  }
  
  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach(promise => promise.then(resolve, reject))
    })
  }
  
  static defer() {
    const df = {}
    df.promise = new Promise((resolve, reject) => {
      df.resolve = resolve
      df.reject = reject
    })
    return df
  }
  
  static deferred = Promise.defer
}

module.exports = Promise
