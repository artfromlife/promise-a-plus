
function resolve(value) {
  if (this.status === STATUS.PENDING) {
    this.value = value
    this.status = STATUS.FULFILLED
  }
}

function reject(value) {
  if (this.status === STATUS.PENDING) {
    this.value = value
    this.status = STATUS.REJECTED
  }
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
    try {
      executor(resolve.bind(this), reject.bind(this))
    }catch (e) {
      reject.call(this,e)
    }
  }
  
  then(onResolve, onRejected) {
  
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
