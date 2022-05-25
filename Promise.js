
function resolve(value) {
  setTimeout(() => {
    if (this.status === STATUS.PENDING) {
      this.value = value
      this.status = STATUS.FULFILLED
      this.resolveCallbacks.forEach(cb => cb(value))
    }
  }, 0)
}

function reject(value) {
  setTimeout(() => {
    if (this.status === STATUS.PENDING) {
      this.value = value
      this.status = STATUS.REJECTED
      this.rejectCallbacks.forEach(cb => cb(value))
    }
  },0)
}
const STATUS = {
  PENDING : 1 ,
  FULFILLED: 2 ,
  REJECTED: 3
}
class Promise {
  constructor(executor) {
    this.status = STATUS.PENDING
    this.value = null
    this.resolveCallbacks = []
    this.rejectCallbacks = []
    try {
      executor(resolve.bind(this), reject.bind(this))
    }catch (e) {
      reject.call(this,e)
    }
  }
  static resolve(value){
    return new Promise((resolve,reject) => {
      resolve(value)
    })
  }
  
  static reject(value){
    return new Promise((resolve,reject) => {
      reject(value)
    })
  }
  
  static race(promises) {
    return new Promise((resolve,reject) => {
      promises.forEach(promise => promise.then((resolve,reject)))
    })
  }
  
  static any(promises) {
    let count = 0
    const result = []
    return new Promise((resolve,reject) => {
      promises.forEach(promise => promise.then((res => {
        ++count
        result.push(res)
        if(count === promises.length){
          resolve(result)
        }
      },reject)))
    })
  }
  
  then (onFulfilled , onRejected) {
    return new Promise((resolve, reject) => {
      try {
        onFulfilled = typeof onFulfilled === "function" ?　onFulfilled : () => {}
        onRejected = typeof onRejected === "function" ?　onRejected : () => {}
        if(this.status === STATUS.FULFILLED) {
          setTimeout(() =>　{
            onFulfilled(this.value)
            resolve(this.value)
          },0)
        }else if(this.status === STATUS.REJECTED){
          setTimeout(() =>　{
            onRejected(this.value)
            reject(this.value)
          },0)
        }else {
          this.resolveCallbacks.push(onFulfilled)
          this.rejectCallbacks.push(onRejected)
        }
      }catch (e) {
        reject(e)
      }
    })
  }
  catch(onRejected) {
  
  }
  
  finally() {
  
  }
  
  static defer() {
    const df = {}
    df.promise = new Promise((resolve,reject) => {
      df.resolve = resolve
      df.reject = reject
    })
    return df
  }
  static deferred = Promise.defer
}

module.exports = Promise
