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

    // 主要是为了处理 thenable
    resolvePromise(promise, callbackRet, resolve, reject) {
        if (promise === callbackRet) {
            throw new TypeError('cyclic')
        }  else if (typeof callbackRet === 'object' || typeof callbackRet === 'function') {
            if (callbackRet === null) return resolve(null)
            let then, thenableCalled = false
            try {
                then = callbackRet.then
            } catch (e) {
                return reject(e)
            }
            try {
                if (typeof then === 'function') {
                    then.call(callbackRet, v => {
                        if (thenableCalled) return
                        thenableCalled = true
                        this.resolvePromise(promise, v, resolve, reject)
                    }, e => {
                        if (thenableCalled) return
                        thenableCalled = true
                        reject(e)
                    })
                } else {
                    resolve(callbackRet)
                }
            } catch (e) {
                if (thenableCalled) return
                reject(e)
            }
        } else {
            resolve(callbackRet)
        }
    }

    then(onFulfilled, onRejected) {
        let promise
        switch (this.status) {
            case Promise.FULFILLED:
                promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            if (typeof onFulfilled === 'function') {
                                this.resolvePromise(promise, onFulfilled(this.value), resolve, reject)
                            } else resolve(this.value)
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
                            if (typeof onRejected === 'function') {
                                this.resolvePromise(promise, onRejected(this.value), resolve, reject)
                            } else reject(this.value)
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
                                if (typeof onFulfilled === 'function') {
                                    this.resolvePromise(promise, onFulfilled(this.value), resolve, reject)
                                } else resolve(this.value)
                            } catch (e) {
                                reject(e)
                            }
                        })
                    })
                    this.onRejecteddCallbacks.push(() => {
                        setTimeout(() => {
                            try {
                                if (typeof onRejected === 'function') {
                                    this.resolvePromise(promise, onRejected(this.value), resolve, reject)
                                } else reject(this.value)
                            } catch (e) {
                                reject(e)
                            }
                        })
                    })
                })
                break;
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
            promises.forEach(promise => promise.then(res => {
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
