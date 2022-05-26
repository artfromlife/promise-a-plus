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
    }, 0)
}

const STATUS = {
    PENDING: 1,
    FULFILLED: 2,
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
        } catch (e) {
            reject.call(this, e)
        }
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

    static race(promises) {
        return new Promise((resolve, reject) => {
            promises.forEach(promise => promise.then((resolve, reject)))
        })
    }

    static all(promises) {
        let count = 0
        const result = []
        return new Promise((resolve, reject) => {
            promises.forEach(promise => promise.then((res => {
                ++count
                result.push(res)
                if (count === promises.length) {
                    resolve(result)
                }
            }, reject)))
        })
    }

    then(onFulfilled, onRejected) {
        return new Promise((resolve, reject) => {
            try {
                onFulfilled = typeof onFulfilled === "function" ? onFulfilled : v => v
                onRejected = typeof onRejected === "function" ? onRejected : v => v
                if (this.status === STATUS.FULFILLED) {
                    const fulfilledValue = onFulfilled(this.value)
                    if (fulfilledValue instanceof Promise) {
                        fulfilledValue.then(resolve, reject)
                    } else {
                        resolve(this.value)
                    }
                } else if (this.status === STATUS.REJECTED) {
                    const rejectedValue = onRejected(this.value)
                    if(rejectedValue instanceof Promise){
                        rejectedValue.then(resolve,reject)
                    }else {
                        reject(this.value)
                    }
                } else {
                    this.resolveCallbacks.push(() => {
                        const fulfilledValue = onFulfilled(this.value)
                        if (fulfilledValue instanceof Promise) {
                            fulfilledValue.then(resolve, reject)
                        } else {
                            resolve(this.value)
                        }
                    })
                    this.rejectCallbacks.push(() => {
                        const rejectedValue = onRejected(this.value)
                        if(rejectedValue instanceof Promise){
                            rejectedValue.then(resolve,reject)
                        }else {
                            reject(this.value)
                        }
                    })
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    catch(onRejected) {
        return this.then(null, onRejected)
    }

    finally(cb) {
        if (this.status === STATUS.PENDING) {
            this.resolveCallbacks.push(cb)
            this.rejectCallbacks.push(cb)
        } else {
            cb()
        }
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
